---
title:  "Settings management in Django"
date:   2016-11-16 9:15:00
description: Simple configuration management with django-environ
---

Django has a pretty good system in place for handling configuration: the settings file. It's the one place you go to set configuration variables for your app. There are a couple of common scenarios however that the settings file doesn't handle super well. Namely sensitive settings and different environments (dev, prod, staging).

We don't want sensitive settings like the secret key or database passwords to be hard-coded in our settings file. There are obvious security implications, like your production secret key being the same as your secret key in development, and anybody who has access to the repo is also inadvertently given direct access to your database.

There's also the matter of different settings for different environments. You're pretty much always going to use a different database during local development and production. You'd probably also want `DEBUG` to be enabled during local development, but disabled in production.

There have been some approaches that handle these scenarios in the past. For example, to handle sensitive settings, we used environment variables, but it wasn't always easy to set these for local development. And to handle different settings for different environments, we used multiple settings files, which can get pretty redundant. These approaches work well enough, but in my opinion are kind of clunky.

I eventually came across a library called [`django-environ`](https://github.com/joke2k/django-environ), and it made configuration management much simpler. What it does is simple, it makes it easy to load environment variables from the system while also allowing us to load configuration variables from a file. Let's see how it works.

We'll set up `django-environ` in our `settings.py` file.

~~~ python
# ./myapp/settings.py

import os

import environ

PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.dirname(PROJECT_DIR)

env = environ.Env(
    SECRET_KEY=str,
    DEBUG=(bool, False),
    ALLOWED_HOSTS=(list, ['127.0.0.1:8000']),
    DATABASE_URL=str,
)

~~~

What we're doing here is defining which variables `django-environ` should look for, set their type, and optionally set a default value.

> You might be wondering what `DATABASE_URL` is. It's basically a string that holds all the information required to connect to a database. Its type (Postgres, MySQL, sqlite), username, password, hostname, port, and database name. Here's an example:
>
> ~~~ bash
> postgres://user:password@host:5432/mydb
> ~~~
>
> You don't have to use it, but it's becoming a common convention these days. It's really convenient that the database parameters don't need to be declared separately.

`django-environ` primarily gets the configuration from the current environment, but we can also make it load variables from a file (usually named `.env`). We'll make sure to add `.env` to our `.gitignore` as to not commit it to our repo. This is important since `.env` will usually hold sensitive settings, as well as environment specific settings.

Let's add a `.env` file to our project root.

~~~ bash
# ./.env

SECRET_KEY=not-so-secret
DEBUG=True
DATABASE_URL=postgres://postgres:password@localhost:5432/myapp
~~~

We can then load this file in `settings.py` like so:

~~~ python
environ.Env.read_env(os.path.join(BASE_DIR, '.env'))
~~~

The variables found in `.env` will override the system environment variables.

Now, to actually use these variables, we'll just use the `env` variable that we
declared earlier.

~~~ python
SECRET_KEY = env('SECRET_KEY')
DEBUG = env('DEBUG')

DATABASES = {
  'default': env.db(),
}
~~~

`env()` will return the value for the given key, or if its not set, the default we specified earlier on. If no value is found and there's no default value, `django-environ` will raise an exception.

> If `DATBASE_URL` is set, `django-environ`  can automatically parse and convert it into a database configuration dictionary ready to be used by Django.

Simple stuff, but this actually solves both of our issues. Sensitive settings are still set in environment variables, but we can conveniently override them in the `.env` file during local development. And to make our app run in different environments, we only need to set the appropriate settings in the `.env` file.

Real cool.

