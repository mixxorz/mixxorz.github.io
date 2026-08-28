---
title: "When not to use agents"
date: 2026-08-28T10:46:00+09:00
excerpt: Agentic systems do not replace deterministic software.
draft: true
---

It's August 2026, and I think a lot of software engineers still get something deeply wrong with agentic systems: they do not replace deterministic software.

I thought this was obvious, but perhaps some clarity will be good.

Let's say you're building a hotel booking system. In the past, what you'd have to do is to essential create a form wizard. First create a form that accepts customer information, then store than in the database. Then, in order to show available room options, write an SQL query that cross references rooms with rooms that have bookings for the period selected. The handle payments, transactional emails, and so on and so forth until you have a working booking system.

| diagram: User -> Booking system -> Output

In the agentic we now live in, I've seen software engineers come up with this architecture instead: Get a model and give it tools like: `update_customer_information`, `run_sql_query`, `send_transactional_email`, `accept_payment`. Along with a system prompt telling the agent how the booking system should work. Then, they expose a chat interface with the customer.

This is bad on so many levels, but the main concern is that this transforms a deterministic booking system in to a sort of russian roulette. With this approach, the business logic is now entirely in the hands of a non-deterministic LLM.

Maybe someday models will get so good, their alignment ratings so high, that we can just give them bare tools and a system prompt and get 100% reliability. But that day is not today, so don't do this.

So what do we do instead? I see two options.

One, just don't use agents bro.

Agent architecture is really good if the problem you're trying to solve is undefined. Allowing the agent to think and decide for itself what the best action is really useful for exploratory workflows, like coding itself.

But, if you need a system to work the same way every time, like how most actual software needs to function, then you're better off building with a non-agentic approach.

The second more interesting approach, is to still use agents, but be smart about the tools that you give to it. The mindset that works best for me is to imagine that you're building a system for human trainees. If the requirement is that staff with limited training should be able to use the software and make zero mistakes, then we would naturally converge on a system that we can hand to an agent to operate.

For example, imagine a hotel front-desk staff checking in a guest. We don't instruct the staff to write SQL to query the database in order to find the guest's booking. Instead, we provide staff with an interface to be able to easily check-in guests. They enter their names, available booking details, and the system automatically runs all the necessary checks and post-check-in procedures.

The same approach works for non-biological agents. Instead of giving them low-level tools, give them tools like `check_in_guest` that accepts provided guest information. Make the tool validate the inputs, deterministically process the check-in, and return information that will be useful to the agent, like that the process succeeded, and perhaps reminders on what to do next.

Every system will be different, but the idea is to design your tools in a way that minimizes agent decision making errors.

A system like this could potentially strike a good balance of being user friendly (the interface is natural language, perhaps even through voice), but also deterministic.
