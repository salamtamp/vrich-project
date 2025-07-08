# Facebook Page API Scheduler

## Overview

The Facebook Page API includes comprehensive scheduler services that can automatically fetch Facebook page posts and comments at specified intervals using configurable cron expressions.

## Features

- **Dual Scheduler System**: Separate schedulers for posts and comments
- **Configurable Cron Schedules**: Set custom cron expressions for both schedulers
- **Page-specific Post Scheduling**: Schedule posts fetching for specific Facebook pages
- **Multi-post Comment Scheduling**: Schedule comments fetching for multiple posts
- **Real-time Status Monitoring**: Check scheduler status, last run, and next run times
- **Dynamic Schedule Updates**: Update cron schedules without restarting schedulers
- **Job Management**: Start, stop, restart, pause, and resume scheduled jobs
- **Post Management**: Add/remove posts from comments scheduler dynamically

## API Endpoints

### Posts Scheduler

#### Start Posts Scheduler
```http
POST /api/v1/facebooks/scheduler/posts/start
Content-Type: application/json

{
    "page_id": "your_facebook_page_id",
    "cron_schedule": "0 * * * *"
}
```

#### Stop Posts Scheduler
```http
POST /api/v1/facebooks/scheduler/posts/stop
```

#### Restart Posts Scheduler
```http
POST /api/v1/facebooks/scheduler/posts/restart
Content-Type: application/json

{
    "page_id": "your_facebook_page_id",
    "cron_schedule": "*/30 * * * *"
}
```

#### Get Posts Scheduler Status
```http
GET /api/v1/facebooks/scheduler/posts/status
```

#### Update Posts Schedule
```http
POST /api/v1/facebooks/scheduler/posts/update
Content-Type: application/json

{
    "page_id": "your_facebook_page_id",
    "cron_schedule": "0 */2 * * *"
}
```

### Comments Scheduler

#### Start Comments Scheduler
```http
POST /api/v1/facebooks/scheduler/comments/start
Content-Type: application/json

{
    "post_ids": ["post_id_1", "post_id_2", "post_id_3"],
    "cron_schedule": "*/5 * * * *"
}
```

#### Stop Comments Schedul
```http
POST /api/v1/facebooks/scheduler/comments/stop
```

#### Restart Comments Scheduler
```http
POST /api/v1/facebooks/scheduler/comments/restart
Content-Type: application/json

{
    "post_ids": ["post_id_1", "post_id_2", "post_id_3"],
    "cron_schedule": "*/10 * * * *"
}
```

#### Get Comments Scheduler Status
```http
GET /api/v1/facebooks/scheduler/comments/status
```

#### Update Comments Schedule
```http
POST /api/v1/facebooks/scheduler/comments/update
Content-Type: application/json

{
    "post_ids": ["post_id_1", "post_id_2", "post_id_3"],
    "cron_schedule": "*/15 * * * *"
}
```

#### Add Posts to Comments Scheduler
```http
POST /api/v1/facebooks/scheduler/comments/add-posts
Content-Type: application/json

{
    "post_ids": ["post_id_4", "post_id_5"]
}
```

#### Remove Posts from Comments Scheduler
```http
POST /api/v1/facebooks/scheduler/comments/remove-posts
Content-Type: application/json

{
    "post_ids": ["post_id_2", "post_id_3"]
}
```