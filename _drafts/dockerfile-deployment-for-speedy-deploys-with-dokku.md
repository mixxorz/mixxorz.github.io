---
title:  "Dockerfile deployment for speedy deploys with Dokku"
description: Using Dockerfile based deployments with Dokku
#date: To be added
---

- What this post is about
- Intro to Dokku
- Advantages of Dockerfile based deployment
- Tutorial
- Conclusion


We've been using Dokku for close to 6 months now, mainly for development, staging, and low traffic production apps. It gives us the flexibility of hosting on our own VPS with the ease of git-push based deploys. Recently, we've moved from using Heroku style buildpacks to Dockerfile based deploys. In this post, I'll describe the _whys_ and _hows_ of Dockerfile based deploys.

# Dokku? What's that?

Dokku describes itself as a *Docker powered mini-Heroku*. Once you've set up Dokku in your server, app deployment is done via a simple `git push`, similar to Heroku. Things like setting environment variables, restarting applications, and provisioning databases are done via a `dokku` command. The docs already describes [how to set up Dokku on your server](http://progrium.viewdocs.io/dokku/installation/), so I won't be going through that in this blog post.

With Dokku, you're able to deploy your apps to your own VPS, Heroku style. Your apps should conform to the [12-factor](http://12factor.net/) methodology for you to be able to deploy them using Dokku. To start with, Dokku has [documentation for application deployment](http://progrium.viewdocs.io/dokku/application-deployment) for you to try out.


# What's wrong with Buildpacks?

Have you ever needed to have Node JS available along with Ruby for your app? Oh. Always? Yeah me too. Using buildpacks, you'd need to hack together a solution, like using a [multi-buildpack](https://github.com/ddollar/heroku-buildpack-multi). If you need to install `npm` and `bower` dependencies, not only will you need to hack together a hook to run all your build commands, you'd also need to wait patiently for your dependencies to finish downloading and installing... *every time you deployed your app*.

It's safe to say that buildpacks have their issues.


# That sucks.

Yeah totally. That's why we moved to using Dockerfiles.

Dokku recently added support for Dockerfile based deploys as an alternative to using buildpacks. Using a Dockerfile gives you almost complete control of your apps' execution environment. This means no more hacking around with buildpacks. As a bonus, since [Docker caching](http://thenewstack.io/understanding-the-docker-cache-for-faster-builds/) exists, your deploys should finish faster than ever. If you've never used Docker before, you can dip your toes by following the [Get Started](https://docs.docker.com/mac/started/) guide on the official Docker website. (If you want to.)

# I'm convinced, let's do it
