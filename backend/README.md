# Backend API Docs (Small)

This README documents a small, useful API endpoint added recently.

## Project Analytics

- GET /api/projects/:id/analytics
  - Description: Returns aggregated analytics for a single project, computed server-side using MongoDB aggregation.
  - Response:
    ```json
    {
      "totalTasks": 10,
      "completedTasks": 6,
      "inProgressTasks": 2,
      "todoTasks": 2,
      "highPriorityTasks": 3,
      "overdueTasks": 1,
      "completionRate": 60
    }
    ```

- POST /api/projects/analytics/batch
  - Description: Returns analytics for multiple projects in a single request. Provide `projectIds` as array of string IDs in request body.
  - Body:
    ```json
    { "projectIds": ["64f9...", "64f9..."] }
    ```
  - Response: Returns a map keyed by project ID with the analytics object as shown above.

# Notes

- Both endpoints require authentication (JWT token) and use the `protect` middleware.
- Analytics are computed on demand, using aggregation pipeline, and are optimized for performance compared to fetching all tasks.
- Future improvements: add caching and/or precomputed analytics for very large-scale datasets.

