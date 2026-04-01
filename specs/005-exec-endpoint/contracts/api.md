# Interface Contract: POST /exec

## Endpoint Details
- **Method**: POST
- **Path**: `/exec`
- **Authentication**: `X-API-Key` Header (Required)
- **Content-Type**: `application/json`

## Request Payload

```json
{
  "command": "echo 'Hello World'",
  "cwd": "/optional/working/directory"
}
```

### Fields
- `command` (String, Required): The shell command to execute. Must not be empty.
- `cwd` (String, Optional): The working directory for execution. Defaults to the user's home directory.

## Response (Envelope Format)

### Success (200 OK)
Returned when the command execution completes. Note that the command itself might have failed (non-zero exit code), but the execution API call was successful.

```json
{
  "data": {
    "exitCode": 0,
    "stdout": "Hello World\n",
    "stderr": ""
  },
  "error": null,
  "meta": {}
}
```

### Errors

- **400 Bad Request**: Invalid payload.
```json
{
  "data": null,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Missing required field: command"
  },
  "meta": {}
}
```

- **401 Unauthorized**: Missing or invalid API key.
```json
{
  "data": null,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid API key"
  },
  "meta": {}
}
```

- **403 Forbidden**: Blocked by Security Engine.
```json
{
  "data": null,
  "error": {
    "code": "FORBIDDEN",
    "message": "Command blocked by security rules: Destructive operation detected."
  },
  "meta": {}
}
```

- **500 Internal Server Error**: Execution errors (e.g. process timeout, exceeding output size limits).
```json
{
  "data": null,
  "error": {
    "code": "EXECUTION_TIMEOUT",
    "message": "Command execution exceeded the timeout limit."
  },
  "meta": {}
}
```