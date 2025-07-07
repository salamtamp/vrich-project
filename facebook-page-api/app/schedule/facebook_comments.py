from app.core.config import get_settings
from apscheduler.executors.pool import ThreadPoolExecutor
from apscheduler.jobstores.memory import MemoryJobStore
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from datetime import datetime
from typing import Dict, Any, List, Optional

import logging

logger = logging.getLogger(__name__)

class FacebookCommentsScheduler:
    def __init__(self):
        self.scheduler = None
        self.settings = get_settings()
        self.jobs_info = {
            "fetch_comments": {
                "id": "fetch_comments_job",
                "name": "Fetch Facebook Comments",
                "schedule": self.settings.FACEBOOK_COMMENTS_CRON_SCHEDULE,
                "last_run": None,
                "next_run": None,
                "status": "stopped",
                "post_ids": []
            }
        }

    def start_scheduler(self, post_ids: List[str], cron_schedule: Optional[str] = None):
        try:
            if cron_schedule is None:
                cron_schedule = self.settings.FACEBOOK_COMMENTS_CRON_SCHEDULE

            if not self.settings.SCHEDULER_ENABLED:
                logger.warning("Scheduler is disabled in settings")
                return

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

            self.scheduler = BackgroundScheduler(
                jobstores=jobstores,
                executors=executors,
                job_defaults=job_defaults,
                timezone=self.settings.SCHEDULER_TIMEZONE
            )

            self.jobs_info["fetch_comments"]["post_ids"] = post_ids
            self.jobs_info["fetch_comments"]["schedule"] = cron_schedule
            self._add_jobs()

            self.scheduler.start()
            logger.info(f"Comments scheduler started successfully for {len(post_ids)} posts with schedule {cron_schedule}")

            for job_info in self.jobs_info.values():
                job_info["status"] = "running"
                if self.scheduler.get_job(job_info["id"]):
                    job_info["next_run"] = self.scheduler.get_job(job_info["id"]).next_run_time.isoformat()

        except Exception as e:
            logger.error(f"Failed to start comments scheduler: {e}")
            raise

    def stop_scheduler(self):
        try:
            if self.scheduler and self.scheduler.running:
                self.scheduler.shutdown(wait=False)
                logger.info("Comments scheduler stopped")

                # Update job status
                for job_info in self.jobs_info.values():
                    job_info["status"] = "stopped"
                    job_info["next_run"] = None

        except Exception as e:
            logger.error(f"Error stopping comments scheduler: {e}")

    def restart_scheduler(self, post_ids: List[str], cron_schedule: Optional[str] = None):
        try:
            if cron_schedule is None:
                cron_schedule = self.settings.FACEBOOK_COMMENTS_CRON_SCHEDULE

            self.stop_scheduler()
            self.start_scheduler(post_ids, cron_schedule)
            logger.info("Comments scheduler restarted successfully")
        except Exception as e:
            logger.error(f"Error restarting comments scheduler: {e}")
            raise

    def _add_jobs(self):
        try:
            cron_parts = self.jobs_info["fetch_comments"]["schedule"].split()
            if len(cron_parts) != 5:
                raise ValueError("Invalid cron format. Expected 5 parts: minute hour day month day_of_week")

            minute, hour, day, month, day_of_week = cron_parts

            self.scheduler.add_job(
                func=self._fetch_comments_job,
                trigger=CronTrigger(
                    minute=minute,
                    hour=hour,
                    day=day,
                    month=month,
                    day_of_week=day_of_week
                ),
                id=self.jobs_info["fetch_comments"]["id"],
                name=self.jobs_info["fetch_comments"]["name"],
                replace_existing=True,
                misfire_grace_time=self.settings.SCHEDULER_MISFIRE_GRACE_TIME
            )

            logger.info(f"Comments scheduled jobs added successfully with cron: {self.jobs_info['fetch_comments']['schedule']}")

        except Exception as e:
            logger.error(f"Error adding comments jobs to scheduler: {e}")
            raise

    def _fetch_comments_job(self):
        try:
            post_ids = self.jobs_info["fetch_comments"]["post_ids"]
            logger.info(f"Starting scheduled comments fetch job for {len(post_ids)} posts")
            self.jobs_info["fetch_comments"]["last_run"] = datetime.now().isoformat()

            from app.api.v1.endpoints.facebooks import fetch_and_queue_comments_service

            import asyncio

            async def fetch_comments_async():
                try:
                    settings = get_settings()
                    successful_posts = 0

                    for post_id in post_ids:
                        logger.info(f"Fetching comments for post {post_id}")

                        success = await fetch_and_queue_comments_service(post_id, settings)
                        if success:
                            successful_posts += 1
                            logger.info(f"Successfully processed comments for post {post_id}")
                        else:
                            logger.error(f"Failed to process comments for post {post_id}")

                    logger.info(f"Completed comments fetch job. Successfully processed {successful_posts}/{len(post_ids)} posts")

                except Exception as e:
                    logger.error(f"Error in fetch_comments_async: {e}")

            asyncio.run(fetch_comments_async())

            if self.scheduler and self.scheduler.get_job(self.jobs_info["fetch_comments"]["id"]):
                next_run = self.scheduler.get_job(self.jobs_info["fetch_comments"]["id"]).next_run_time
                if next_run:
                    self.jobs_info["fetch_comments"]["next_run"] = next_run.isoformat()

            logger.info(f"Scheduled comments fetch job completed successfully for {len(post_ids)} posts")

        except Exception as e:
            logger.error(f"Error in scheduled comments fetch job: {e}")

    def is_running(self) -> bool:
        return self.scheduler is not None and self.scheduler.running

    def get_jobs_info(self) -> Dict[str, Any]:
        if self.scheduler and self.scheduler.running:
            for job_info in self.jobs_info.values():
                job = self.scheduler.get_job(job_info["id"])
                if job and job.next_run_time:
                    job_info["next_run"] = job.next_run_time.isoformat()
                else:
                    job_info["next_run"] = None

        return self.jobs_info

    def get_job_status(self, job_id: str) -> Dict[str, Any]:
        if job_id in self.jobs_info:
            job_info = self.jobs_info[job_id].copy()

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
        try:
            if self.scheduler and self.scheduler.running:
                self.scheduler.pause_job(job_id)
                if job_id in self.jobs_info:
                    self.jobs_info[job_id]["status"] = "paused"
                logger.info(f"Comments job {job_id} paused")
        except Exception as e:
            logger.error(f"Error pausing comments job {job_id}: {e}")
            raise

    def resume_job(self, job_id: str):
        try:
            if self.scheduler and self.scheduler.running:
                self.scheduler.resume_job(job_id)
                if job_id in self.jobs_info:
                    self.jobs_info[job_id]["status"] = "running"
                logger.info(f"Comments job {job_id} resumed")
        except Exception as e:
            logger.error(f"Error resuming comments job {job_id}: {e}")
            raise

    def update_schedule(self, post_ids: List[str], new_cron_schedule: Optional[str] = None):
        try:
            if new_cron_schedule is None:
                new_cron_schedule = self.settings.FACEBOOK_COMMENTS_CRON_SCHEDULE

            if self.scheduler and self.scheduler.running:
                cron_parts = new_cron_schedule.split()
                if len(cron_parts) != 5:
                    raise ValueError("Invalid cron format. Expected 5 parts: minute hour day month day_of_week")

                minute, hour, day, month, day_of_week = cron_parts

                self.scheduler.reschedule_job(
                    job_id=self.jobs_info["fetch_comments"]["id"],
                    trigger=CronTrigger(
                        minute=minute,
                        hour=hour,
                        day=day,
                        month=month,
                        day_of_week=day_of_week
                    )
                )

                self.jobs_info["fetch_comments"]["schedule"] = new_cron_schedule
                self.jobs_info["fetch_comments"]["post_ids"] = post_ids

                logger.info(f"Comments schedule updated to {new_cron_schedule} for {len(post_ids)} posts")
            else:
                raise RuntimeError("Comments scheduler is not running")

        except Exception as e:
            logger.error(f"Error updating comments schedule: {e}")
            raise

    def add_post_ids(self, post_ids: List[str]):
        try:
            current_post_ids = self.jobs_info["fetch_comments"]["post_ids"]
            new_post_ids = list(set(current_post_ids + post_ids))
            self.jobs_info["fetch_comments"]["post_ids"] = new_post_ids
            logger.info(f"Added {len(post_ids)} new post IDs to comments scheduler")
        except Exception as e:
            logger.error(f"Error adding post IDs: {e}")
            raise

    def remove_post_ids(self, post_ids: List[str]):
        try:
            current_post_ids = self.jobs_info["fetch_comments"]["post_ids"]
            updated_post_ids = [pid for pid in current_post_ids if pid not in post_ids]
            self.jobs_info["fetch_comments"]["post_ids"] = updated_post_ids
            logger.info(f"Removed {len(post_ids)} post IDs from comments scheduler")
        except Exception as e:
            logger.error(f"Error removing post IDs: {e}")
            raise

facebook_comments_scheduler = FacebookCommentsScheduler()