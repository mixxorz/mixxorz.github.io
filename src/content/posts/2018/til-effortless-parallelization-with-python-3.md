---
title: "TIL: Effortless parallelization with Python 3"
date: 2018-09-21T10:00:00+08:00
excerpt: Run things in multiple threads
---

Earlier this week I had a task which required me to send numerous (~5K) AWS S3
copy requests through the `boto3` API. Each request took roughly 1 second so
that means it would take about an hour and twenty minutes to finish this
process. The requests didn't depend on each other, so I decided to parallelize
the requests using threads.

I've had some experience with threads in the past but I decided to try out
something new. Namely, `ThreadPoolExecutor`.

Here's how it looks:

```python
from concurrent.futures import ThreadPoolExecutor
import boto3

s3 = boto3.client('s3')
keys = [...]  # A long list of things to copy


def copy(key):
    s3.copy(...)  # Cut for brevity


with ThreadPoolExecutor(max_workers=20) as executor:
    for key in keys:
        executor.submit(copy, key)
```

Voilà, instant parallelization.
