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

Cool. This will take like, 5 minutes. But first, we'll need a couple of things.

- A server with Dokku installed on it.
- Dokku works. (You can deploy apps.)

Once you have those, we can start.

We'll keep it simple. We'll be deploying a simple "Hello, World" static website. You can clone the repo from [here](#todo) if you don't want to copy paste stuff.

First, create the project directory and the HTML files that you want to serve.

Example:

```
myapp/
  - index.html

```

I just put some basic markup on mine, but you can put whatever you want on yours.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Hello, World!</title>
</head>
<body>
    <h1>Dokku is awesome!</h1>
</body>
</html>
```

Next, let's write the Dockerfile. Remember, since we're using Dockerfiles, we have a lot of control with our apps execution environment. In this example, I'll just use the official Python base image, and use [SimpleHTTPServer] to host our app.

```Dockerfile
FROM python:2.7
ENV PYTHONUNBUFFERED 1

COPY . /webapp

WORKDIR /webapp

EXPOSE 8000

CMD ["python", "-m", "SimpleHTTPServer", "8000"]
```

As you can see, it's pretty straightforward.

- We're using the `python:2.7` base image for our app.
- We `COPY` our code to `/webapp` inside the docker image.
- We set the working directory to `/webapp`.
- We set `8000` as the port we want to expose. Dokku reads what port you exposed in your Dockerfile to know which port it should reverse proxy with nginx.
- Finally, we run `python -m SimpleHTTPServer 8000` to start the server on port 8000.
<br><br>
Let's go ahead and push it up to dokku.

```
$ git init
$ git add -A
$ git commit -m "Initial commit"
$ dokku apps:create
-----> Dokku remote added at mitchel.me
-----> Application name is stea-hate-jugen
Counting objects: 9, done.
Delta compression using up to 4 threads.
Compressing objects: 100% (6/6), done.
Writing objects: 100% (9/9), 929 bytes | 0 bytes/s, done.
Total 9 (delta 0), reused 0 (delta 0)
-----> Cleaning up...
-----> Building stea-hate-jugen from dockerfile...
-----> Setting config vars
       DOKKU_DOCKERFILE_PORT: 8000
      .
      .
      . (hidden for brevity)
      .
      .
=====> Application deployed:
       http://stea-hate-jugen.mitchel.me

To dokku@mitchel.me:stea-hate-jugen
 * [new branch]      master -> master
```

Ta-dah!

The example we did was just a simple static app. But again, with Dockerfiles, you can configure the environment almost any way you want. You can use a Ruby base image, and install Node on top of it if you wanted to.

[SimpleHTTPServer]:https://docs.python.org/2/library/simplehttpserver.html
