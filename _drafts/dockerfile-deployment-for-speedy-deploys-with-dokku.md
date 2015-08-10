---
title:  "Using Dockerfiles for speedier deploys with Dokku"
description: Deploys faster than you can open twitter
#date: To be added
---

We've been using Dokku for close to 6 months now, mainly for development, staging, and low traffic production apps. It gives us the flexibility of hosting on our own VPS with the ease of git-push based deploys. Recently, we've moved from using Heroku style buildpacks to Dockerfile based deploys. Because it's awesome.

# Dokku? What's that?

Dokku describes itself as a *Docker powered mini-Heroku*. Once you've set up Dokku in your server, app deployment is done via a simple `git push`, similar to Heroku. Things like setting environment variables, restarting applications, and provisioning databases are done via a `dokku` command. The docs already describe [how to set up Dokku on your server], so I won't be going through that in this blog post.

With Dokku, you're able to deploy your apps to your own VPS, Heroku style. Your apps should conform to the [12-factor] methodology for you to be able to deploy them using Dokku. To start with, Dokku has [documentation for application deployment] for you to try out.

# What's wrong with Buildpacks?

Have you ever needed to have Node JS available along with Ruby/Python for your app? Oh. Always? Yeah me too. Using buildpacks, you'd need to hack together a solution, like using a [multi-buildpack]. If you need to install `npm` and `bower` dependencies, not only will you need to hack together a hook to run all your build commands, you'd also need to wait patiently for your dependencies to finish downloading and installing... *every time you deployed your app*.

It's safe to say that buildpacks have their issues.

# That sucks.

Yeah totally. That's why we moved to using Dockerfiles.

Dokku recently added support for Dockerfile based deploys as an alternative to using buildpacks. Using a Dockerfile gives you almost complete control of your apps' execution environment. This means no more hacking around with buildpacks. As a bonus, since [Docker caching] exists, your deploys should finish faster than ever. If you've never used Docker before, you can dip your toes by following the [Get Started] guide on the official Docker website. (If you want to.)

# Sounds good. How does it work?

It's simple really. Instead of setting up your app with buildpacks, you write a Dockerfile for it. A Dockerfie is a set of instructions used by Docker to build your docker image. If you have a Dockerfile present in the repo you push up to Dokku, it will proceed to build your app using the Dockerfile instead of using buildpacks.

I made a sample [Django app] that you can deploy to Dokku to show you how it all works. The app has a fairly complicated setup. It first needs to download the `npm` dependencies and build the assets using [Gulp] before it can be deployed. I did this to give you an idea of how much control you can have by using Dockerfiles for deploys.

Here's how to deploy it on your own Dokku server:

First, clone the repo:

```bash
$ git clone https://github.com/mixxorz/dokku-django-gulp
$ cd dokku-django-gulp
```

Create the dokku app:

```bash
$ dokku apps:create dokku-django-gulp
```

Set the required environment variables:

```bash
$ dokku config:set SECRET_KEY=your-secret-key \
   ALLOWED_HOSTS=dokku-django-gulp.yourdomain.com \
   DATABASE_URL=sqlite://db.sqlite3
```

Add the remote:

```bash
$ git remote add dokku dokku@yourdomain.com:dokku-django-gulp
```

Git push!

```bash
$ git push dokku master
Counting objects: 93, done.
Delta compression using up to 4 threads.
Compressing objects: 100% (80/80), done.
Writing objects: 100% (93/93), 12.93 KiB | 0 bytes/s, done.
Total 93 (delta 38), reused 0 (delta 0)
-----> Cleaning up...
-----> Building dokku-django-gulp from dockerfile...
-----> Setting config vars
        .
        .
        . # removed for brevity
        .
        .
=====> Application deployed:
       http://dokku-django-gulp.yourdomain.com

To dokku@yourdomain.com:dokku-django-gulp
   682d568..9f906ab  master -> master
```

Your initial push might take a little while. This is because it has to download all the necessary files for the first time. In successive builds however, [Docker caching] will kick in and you'll have sub-minute build times!

There is a small snag. [Docker caching currently has a bug]. It takes the modified time (mtime) of each file into account when deciding whether it's a cache hit or miss. Since git always updates the mtime when it deals with your files, the cache will always miss. The fix for this issue will be released with Docker 1.8.0, but until then I've made a [dokku plugin] that works around this issue by resetting the mtime on your source files before Docker gets its hands on it.

There we go. An app deployed to Dokku using a Dockerfile. Try changing a few lines of Sass, commit, and push to witness for yourselves how fast a Dockerfile based deploy is.


[how to set up Dokku on your server]:http://progrium.viewdocs.io/dokku/installation/
[12-factor]:http://12factor.net/
[documentation for application deployment]:http://progrium.viewdocs.io/dokku/application-deployment
[multi-buildpack]:https://github.com/ddollar/heroku-buildpack-multi
[Docker caching]:http://thenewstack.io/understanding-the-docker-cache-for-faster-builds/
[Get Started]:https://docs.docker.com/mac/started/
[Django app]:https://github.com/mixxorz/dokku-django-gulp
[Gulp]:http://gulpjs.com/
[Docker caching currently has a bug]:https://github.com/docker/docker/pull/12031
[dokku plugin]:https://github.com/mixxorz/dokku-docker-reset-mtime
