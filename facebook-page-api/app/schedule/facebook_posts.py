import logging
from datetime import datetime
from typing import Dict, List, Any, Optional, Union
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger
from apscheduler.jobstores.memory import MemoryJobStore
from apscheduler.executors.pool import ThreadPoolExecutor

from app.core.config import get_settings

logger = logging.getLogger(__name__)

class FacebookPostsScheduler:
    def __init__(self):
        self.scheduler = None
        self.settings = get_settings()
        self.jobs_info = {
            "fetch_posts": {
                "id": "fetch_posts_job",
                "name": "Fetch Facebook Posts",
                "schedule": self.settings.FACEBOOK_POSTS_CRON_SCHEDULE,
                "last_run": None,
                "next_run": None,
                "status": "stopped",
                "page_id": None,
                "trigger_type": "cron"  # Add trigger type
            }
        }

    def start_scheduler(self, page_id: str, schedule: Optional[Union[str, int]] = None, trigger_type: str = "cron"):
        """Initialize and start the scheduler with configurable schedule"""
        try:
            # Use provided schedule or fall back to settings
            if schedule is None:
                schedule = self.settings.FACEBOOK_POSTS_CRON_SCHEDULE
                trigger_type = "cron"

            # Check if scheduler is enabled
            if not self.settings.SCHEDULER_ENABLED:
                logger.warning("Scheduler is disabled in settings")
                return

            # Configure job stores and executors
            jobstores = {
                'default': MemoryJobStore()
            }
            executors = {
                'default': ThreadPoolExecutor(self.settings.SCHEDULER_THREAD_POOL_SIZE)
            }
            job_defaults = {
                'coalesce': self.settings.SCHEDULER_COALESCE,
                'max_instances': self.settings.SCHEDULER_MAX_INSTANCES
            }

            # Create scheduler
            self.scheduler = BackgroundScheduler(
                jobstores=jobstores,
                executors=executors,
                job_defaults=job_defaults,
                timezone=self.settings.SCHEDULER_TIMEZONE
            )

            # Update job info with provided parameters
            self.jobs_info["fetch_posts"]["page_id"] = page_id
            self.jobs_info["fetch_posts"]["schedule"] = schedule
            self.jobs_info["fetch_posts"]["trigger_type"] = trigger_type

            # Add jobs
            self._add_jobs()

            # Start scheduler
            self.scheduler.start()
            logger.info(f"Scheduler started successfully for page {page_id} with {trigger_type} schedule: {schedule}")

            # Update job status
            for job_info in self.jobs_info.values():
                job_info["status"] = "running"
                if self.scheduler.get_job(job_info["id"]):
                    job_info["next_run"] = self.scheduler.get_job(job_info["id"]).next_run_time.isoformat()

        except Exception as e:
            logger.error(f"Failed to start scheduler: {e}")
            raise

    def stop_scheduler(self):
        """Stop the scheduler"""
        try:
            if self.scheduler and self.scheduler.running:
                self.scheduler.shutdown(wait=False)
                logger.info("Scheduler stopped")

                # Update job status
                for job_info in self.jobs_info.values():
                    job_info["status"] = "stopped"
                    job_info["next_run"] = None

        except Exception as e:
            logger.error(f"Error stopping scheduler: {e}")

    def restart_scheduler(self, page_id: str, schedule: Optional[Union[str, int]] = None, trigger_type: str = "cron"):
        """Restart the scheduler with new parameters"""
        try:
            # Use provided cron_schedule or fall back to settings
            if schedule is None:
                schedule = self.settings.FACEBOOK_POSTS_CRON_SCHEDULE
                trigger_type = "cron"

            self.stop_scheduler()
            self.start_scheduler(page_id, schedule, trigger_type)
            logger.info("Scheduler restarted successfully")
        except Exception as e:
            logger.error(f"Error restarting scheduler: {e}")
            raise

    def _add_jobs(self):
        """Add scheduled jobs to the scheduler"""
        try:
            trigger_type = self.jobs_info["fetch_posts"]["trigger_type"]
            schedule = self.jobs_info["fetch_posts"]["schedule"]

            if trigger_type == "cron":
                # Parse cron schedule
                cron_parts = schedule.split()
                if len(cron_parts) != 5:
                    raise ValueError("Invalid cron format. Expected 5 parts: minute hour day month day_of_week")

                minute, hour, day, month, day_of_week = cron_parts
                trigger = CronTrigger(
                    minute=minute,
                    hour=hour,
                    day=day,
                    month=month,
                    day_of_week=day_of_week
                )
            elif trigger_type == "interval":
                # Parse interval schedule (seconds)
                if isinstance(schedule, str):
                    seconds = int(schedule)
                else:
                    seconds = schedule
                trigger = IntervalTrigger(seconds=seconds)
            else:
                raise ValueError(f"Unsupported trigger type: {trigger_type}")

            # Job: Fetch posts based on schedule
            self.scheduler.add_job(
                func=self._fetch_posts_job,
                trigger=trigger,
                id=self.jobs_info["fetch_posts"]["id"],
                name=self.jobs_info["fetch_posts"]["name"],
                replace_existing=True,
                misfire_grace_time=self.settings.SCHEDULER_MISFIRE_GRACE_TIME
            )

            logger.info(f"Scheduled jobs added successfully with {trigger_type}: {schedule}")

        except Exception as e:
            logger.error(f"Error adding jobs to scheduler: {e}")
            raise

    def _fetch_posts_job(self):
        """Job function to fetch posts"""
        try:
            page_id = self.jobs_info["fetch_posts"]["page_id"]
            logger.info(f"Starting scheduled post fetch job for page {page_id}")
            self.jobs_info["fetch_posts"]["last_run"] = datetime.now().isoformat()

            from app.api.v1.endpoints.facebooks import fetch_and_queue_posts_service

            import asyncio

            async def fetch_posts_async():
                try:
                    settings = get_settings()

                    logger.info(f"Fetching posts for page {page_id}")

                    success = await fetch_and_queue_posts_service(page_id, settings)

                    if success:
                        logger.info(f"Successfully processed posts for page {page_id}")
                    else:
                        logger.error(f"Failed to process posts for page {page_id}")

                    logger.info(f"Completed posts fetch job. Successfully processed posts for page {page_id}")

                except Exception as e:
                    logger.error(f"Error in fetch_posts_async: {e}")

            asyncio.run(fetch_posts_async())

            # Update next run time
            if self.scheduler and self.scheduler.get_job(self.jobs_info["fetch_posts"]["id"]):
                next_run = self.scheduler.get_job(self.jobs_info["fetch_posts"]["id"]).next_run_time
                if next_run:
                    self.jobs_info["fetch_posts"]["next_run"] = next_run.isoformat()

            logger.info(f"Scheduled post fetch job completed successfully for page {page_id}")

        except Exception as e:
            logger.error(f"Error in scheduled post fetch job: {e}")
            # Don't raise the exception to prevent job from being removed

    def is_running(self) -> bool:
        """Check if scheduler is running"""
        return self.scheduler is not None and self.scheduler.running

    def get_jobs_info(self) -> Dict[str, Any]:
        """Get information about all jobs"""
        # Update next run times from scheduler
        if self.scheduler and self.scheduler.running:
            for job_info in self.jobs_info.values():
                job = self.scheduler.get_job(job_info["id"])
                if job and job.next_run_time:
                    job_info["next_run"] = job.next_run_time.isoformat()
                else:
                    job_info["next_run"] = None

        return self.jobs_info

    def get_job_status(self, job_id: str) -> Dict[str, Any]:
        """Get status of a specific job"""
        if job_id in self.jobs_info:
            job_info = self.jobs_info[job_id].copy()

            # Get additional info from scheduler
            if self.scheduler and self.scheduler.running:
                job = self.scheduler.get_job(job_info["id"])
                if job:
                    job_info["next_run"] = job.next_run_time.isoformat() if job.next_run_time else None
                    job_info["active"] = True
                else:
                    job_info["active"] = False
                    job_info["next_run"] = None
            else:
                job_info["active"] = False
                job_info["next_run"] = None

            return job_info
        else:
            return {"error": "Job not found"}

    def pause_job(self, job_id: str):
        """Pause a specific job"""
        try:
            if self.scheduler and self.scheduler.running:
                self.scheduler.pause_job(job_id)
                if job_id in self.jobs_info:
                    self.jobs_info[job_id]["status"] = "paused"
                logger.info(f"Job {job_id} paused")
        except Exception as e:
            logger.error(f"Error pausing job {job_id}: {e}")
            raise

    def resume_job(self, job_id: str):
        """Resume a specific job"""
        try:
            if self.scheduler and self.scheduler.running:
                self.scheduler.resume_job(job_id)
                if job_id in self.jobs_info:
                    self.jobs_info[job_id]["status"] = "running"
                logger.info(f"Job {job_id} resumed")
        except Exception as e:
            logger.error(f"Error resuming job {job_id}: {e}")
            raise

    def update_schedule(self, page_id: str, new_schedule: Optional[Union[str, int]] = None, trigger_type: str = "cron"):
        """Update the schedule for the job"""
        try:
            if self.scheduler and self.scheduler.running:
                # Use provided schedule or fall back to settings
                if new_schedule is None:
                    new_schedule = self.settings.FACEBOOK_POSTS_CRON_SCHEDULE
                    trigger_type = "cron"

                if trigger_type == "cron":
                    # Parse new cron schedule
                    cron_parts = new_schedule.split()
                    if len(cron_parts) != 5:
                        raise ValueError("Invalid cron format. Expected 5 parts: minute hour day month day_of_week")

                    minute, hour, day, month, day_of_week = cron_parts
                    trigger = CronTrigger(
                        minute=minute,
                        hour=hour,
                        day=day,
                        month=month,
                        day_of_week=day_of_week
                    )
                elif trigger_type == "interval":
                    # Parse interval schedule (seconds)
                    if isinstance(new_schedule, str):
                        seconds = int(new_schedule)
                    else:
                        seconds = new_schedule
                    trigger = IntervalTrigger(seconds=seconds)
                else:
                    raise ValueError(f"Unsupported trigger type: {trigger_type}")

                # Update the job with new trigger
                self.scheduler.reschedule_job(
                    job_id=self.jobs_info["fetch_posts"]["id"],
                    trigger=trigger
                )

                # Update job info
                self.jobs_info["fetch_posts"]["schedule"] = new_schedule
                self.jobs_info["fetch_posts"]["page_id"] = page_id
                self.jobs_info["fetch_posts"]["trigger_type"] = trigger_type

                logger.info(f"Schedule updated to {trigger_type}: {new_schedule} for page {page_id}")
            else:
                raise RuntimeError("Scheduler is not running")

        except Exception as e:
            logger.error(f"Error updating schedule: {e}")
            raise

# Global scheduler instance
facebook_posts_scheduler = FacebookPostsScheduler()

# Export functions for compatibility with facebooks.py
async def start_posts_scheduler(page_id: str, schedule=None, trigger_type: str = "cron", settings=None):
    """Start the posts scheduler"""
    try:
        facebook_posts_scheduler.start_scheduler(page_id, schedule, trigger_type)
        return True
    except Exception as e:
        logger.error(f"Error starting posts scheduler: {e}")
        return False

async def stop_posts_scheduler():
    """Stop the posts scheduler"""
    try:
        facebook_posts_scheduler.stop_scheduler()
        return True
    except Exception as e:
        logger.error(f"Error stopping posts scheduler: {e}")
        return False

async def restart_posts_scheduler(page_id: str, schedule=None, trigger_type: str = "cron", settings=None):
    """Restart the posts scheduler"""
    try:
        facebook_posts_scheduler.restart_scheduler(page_id, schedule)
        return True
    except Exception as e:
        logger.error(f"Error restarting posts scheduler: {e}")
        return False

async def get_posts_scheduler_status():
    """Get the status of the posts scheduler"""
    try:
        return facebook_posts_scheduler.get_jobs_info()
    except Exception as e:
        logger.error(f"Error getting posts scheduler status: {e}")
        raise