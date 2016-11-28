---
title:  Consolidating your dev processes with honcho
date:   2016-11-27 13:50:00
description: Do away with multiple terminal sessions
---

Front-end build tools like gulp, grunt, or webpack are awesome (or a necessary evil depending on who you ask). Using them can make you a much more productive web developer. In my projects for example, I always use gulp with BrowserSync so that whenever I make a change in one of my Sass files, it automatically compiles and injects it onto the webpage. No refreshing required. (You can learn how to do that [here](https://www.browsersync.io/docs/gulp#gulp-sass-css).)

That's super amazing. But there's one thing that annoyed me about using these tools; I have to open a new session in my terminal to run it.

I mainly use Django for my web projects, which means I'll need to have Django's
dev server running alongside gulp, which also needs to be continuously running for it to automatically work on your files when it detects changes. In practice, I'll need to have two terminals: one for Django and one for gulp. This is a very minor annoyance and for a while, I just dealt with it.

One day I stumbled upon [honcho](https://honcho.readthedocs.io/en/latest/). It's a command-line tool that lets you manage [Procfile-based applications](https://devcenter.heroku.com/articles/procfile). You create a file named `Procfile` where you specify the processes your app needs to run, and honcho takes care of spawning them. Here's an example from one of the projects I worked on:

~~~ conf
# Taken from a project called "bagnet"
web: gunicorn --config deploy/gunicorn.conf bagnet.wsgi
celery: celery -A bagnet.celery:app worker -n celery
cacheback: celery -A bagnet.celery:app worker -n cacheback -Q cacheback
crawler_twitter: ./crawl.py twitter
~~~

Here I declared four processes: `web`, `celery`, `cacheback`, and `crawler_twitter`. These four processes all need to be running simultaneously for the app to work. To spawn these processes, just run `honcho start`.

> I first used Procfiles when I started playing around with Heroku. Over there it's used to declare what commands are run by your application's dynos. How you use Procfiles in production is out of the scope of this blog post, but Procfiles can still be useful to you for local development even if you don't plan on using them in production.

## Using honcho for local development

Even if you don't use Procfiles to run your app in production, they can greatly help you streamline your development environment. Instead of having to run the app's development server and gulp in separate terminal sessions, you can use honcho to keep them in a single session.

Let's create a file named `Procfile.dev`. This is where we'll declare our processes.

~~~conf
# Procfile.dev
web: python manage.py runserver  # Django's dev server
gulp: gulp watch
~~~

Now we can spawn these two processes at the same time with `honcho -f Procfile.dev start`

~~~shell_session
$ honcho -f Procfile.dev start
21:32:45 system | web.1 started (pid=30951)
21:32:45 system | gulp.1 started (pid=30952)
21:32:46 web.1  | Performing system checks...
21:32:46 web.1  |
21:32:46 web.1  | System check identified no issues (0 silenced).
21:32:47 web.1  | November 26, 2016 - 21:32:47
21:32:47 web.1  | Django version 1.10.2, using settings 'por_favor.settings'
21:32:47 web.1  | Starting development server at http://127.0.0.1:8000/
21:32:47 web.1  | Quit the server with CONTROL-C.
21:32:48 gulp.1 | [21:32:48] Using gulpfile ~/Projects/kirigami/super-app/gulpfile.js
21:32:48 gulp.1 | [21:32:48] Starting 'browser-sync'...
21:32:49 gulp.1 | [21:32:49] Finished 'browser-sync' after 138 ms
21:32:49 gulp.1 | [21:32:49] Starting 'default'...
21:32:54 gulp.1 | [21:32:54] Finished 'default' after 5.84 s
21:32:55 gulp.1 | [BS] Proxying: http://127.0.0.1:8000
21:32:55 gulp.1 | [BS] Access URLs:
21:32:55 gulp.1 |  --------------------------------------
21:32:55 gulp.1 |        Local: http://localhost:3000
21:32:55 gulp.1 |     External: http://192.168.1.121:3000
21:32:55 gulp.1 |  --------------------------------------
21:32:55 gulp.1 |           UI: http://localhost:3001
21:32:55 gulp.1 |  UI External: http://192.168.1.121:3001
21:32:55 gulp.1 |  --------------------------------------
~~~

The terminal output is prefixed too so we know which process it came from.

## Language agnostic

Notice that none of this is actually language specific. You can use honcho with anything. Here's what I use for developing WordPress themes:

~~~ conf
# Procfile.dev
web: php -S 0.0.0.0:8000 -t web/
gulp: gulp
~~~

Sweet, right?
