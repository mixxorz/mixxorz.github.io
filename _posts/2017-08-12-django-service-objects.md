---
title:  "Django Service Objects"
date:   2017-08-12 12:00:00
description: Using Service objects to encapsulate business logic
---

Starting a new project is always exciting. You spec out the features, start writing your tests, and implement your code. But then somewhere along the way, it starts to become a drag. You start to have so many models, and so many views, and so much logic to implement that you don't even know where to put them. Or more realistically, you've lost track of where you've put them.

## Is there a better way?

Yes! Service objects to the rescue!

## What are service objects?

Simply put, service objects are where you put your business logic.

Let's say you're building a booking system. When a customer makes a booking, the app should create a new customer or get an existing one, it should create a booking in the database, and then send a verification email. When the email is verified, the app should update the status of the booking, and notify the admin. Finally, when the admin approves the booking, the app should update the status of the booking, create an invoice, and send it to the customer.

All of that logic should live in service objects.

Enough talk. Let's code!

## So what does a service object look like?

Like this:

```python
# apps/booking/services.py

from django import forms

from .models import Booking, Customer
from .notifications import VerifyEmailNotification
from some_project.services import Service


class CreateBookingService(Service):
    name = forms.CharField()
    email = forms.EmailField()
    checkin_date = forms.DateField()
    checkout_date = forms.DateField()

    def process(self):
        name = self.cleaned_data['name']
        email = self.cleaned_data['email']
        checkin_date = self.cleaned_data['checkin_date']
        checkout_date = self.cleaned_data['checkout_date']

        # Update or create a customer
        customer = Customer.objects.update_or_create(
            email=email,
            defaults={
                'name': name
            }
        )

        # Create booking
        booking = Booking.objects.create(
            customer=customer,
            checkin_date=checkin_date,
            checkout_date=checkout_date,
            status=Booking.PENDING_VERIFICATION,
        )

        # Send verification email (check out django-herald)
        VerifyEmailNotification(booking).send()

        return booking
```

Service objects inherit from `Service` (implementation below) and it has a similar API to Django Forms. That's because Service actually inherits from `forms.Form`. The only difference you have to implement a `process` method where you put your business logic.

Here I wrote a `CreateBookingService` that does three things.

1. Updates or creates a `Customer`
2. Creates a `Booking`
3. Sends a verification email

## OK. Interesting. How do you use it?

Just call `execute` on the class, passing in a `dict` of parameters, just like Forms.

```python
from datetime import date

from apps.booking.services import CreateBookingService

booking = CreateBookingService.execute({
    'name': 'Mitchel Cabuloy',
    'email': 'mixxorz@gmail.com',
    'checkin_date': date(2017, 8, 12),
    'checkout_date': date(2017, 8, 15),
})
```

And your `process` method executes and returns the booking.

Here's the base class' definition so you can understand a bit more how it works:

```python
# some_project/services.py

from django import forms
from django.db import transaction

from .errors import InvalidInputsError


class Service(forms.Form):

    def service_clean(self):
        if not self.is_valid():
            raise InvalidInputsError(
                self.errors, self.non_field_errrors())

    @classmethod
    def execute(cls, inputs, files=None, **kwargs):
        instance = cls(inputs, files, **kwargs)
        instance.service_clean()
        with transaction.atomic():
            return instance.process()

    def process(self):
        raise NotImplementedError()
```

The base `Service` class' `execute` method makes sure that `process` runs inside a transaction and it also validates the inputs and raises an exception if it's invalid.

```python
# some_project/errors.py

class InvalidInputsError(Exception):

    def __init__(self, errors, non_field_errors):
        self.errors = errors
        self.non_field_errors = non_field_errors

    def __str__(self):
        return (
            f'{repr(self.errors)} '
            f'{repr(self.non_field_errors)}')
```

`InvalidInputsError` is raised when you try to execute a service but the inputs are invalid. You can access the invalid fields in the `errors` attribute. It also prints out the invalid fields for easier debugging.

## Huh.

Cool right? There's more.

Let's say there are some instances where email verification isn't required so we want to disable it. You do it like this:

```python
class CreateBookingService(Service):
    # ...fields

    def __init__(self, *args, require_verification=True):
        self.require_verification = require_verification

        super().__init__(self, *args)

    def process(self):
        # ...previous code cut for brevity

        if self.require_verification:
            booking.status=Booking.PENDING_VERIFICATION
            booking.save()
            VerifyEmailNotification(booking).send()

        return booking
```

We just added a `require_verification` keyword argument to the constructor. And here's how to use it:

```python
booking = CreateBookingService.execute({
    'name': 'Mitchel Cabuloy',
    'email': 'mixxorz@gmail.com',
    'checkin_date': date(2017, 8, 12),
    'checkout_date': date(2017, 8, 15),
}, require_verification=False)
```

Really simple.

## But why?

Using services objects has a number of advantages:

### Decoupled from presentation logic

Now that your business logic is in its own class, you can call it from anywhere. From regular Django views, JSON endpoints, management commands, RQ tasks, Django admin, etc. Your business logic is no longer bound to your views or models.

### Easily testable and mockable

Since service objects are just objects, you can easily call them from your tests to verify their behavior. Similarly, if you're testing your view or endpoint, you can easily mock out the service objects.

### Input validation

Your code will become a lot more concise now that you don't have to manually check whether or not a parameter is valid. If you need to know why your inputs failed validation, just catch `InvalidInputsError` and access the `errors` or `non_field_errors` dictionary. Better yet, raise a custom exception from your service object.

## But fat models…

I tried fat models, but the models just ended up doing too many things. Plus it wasn't very clear which model a method belongs to if it operated on two different models. (Should `Booking` have `create_booking` or should `Customer`)? Nowadays I prefer that my models stay lean and side-effect free.

## Some gotcha's

Since service objects are built on top of Forms, there are a couple of quirky things.

### Models as arguments

You can't just pass in a model instance. Instead of you have to pass in the ID.

```python
class ApproveBookingService(Service):
    booking = forms.ModelChoiceField(
        queryset=Booking.objects.all())

    def process(self):
        # A Booking instance
        booking = self.cleaned_data['booking']
        booking.approve()
        booking.save()

        return booking


some_booking = Booking.objects.get()

# Pass in 'some_booking.pk'
ApproveBookingService.execute({
    'booking': some_booking.pk
})
```

### List of objects as arguments

Since Forms have no ability to receive a list of objects as an input, I had to write a custom form field for that.

```python
class MultipleFormField(forms.Field):
    """
    A field that contains many forms, similar to a FormSet but easier to clean
    """

    def __init__(self, form_class, min_count=1, max_count=None, *args,
                 **kwargs):
        super().__init__(*args, **kwargs)

        self.form_class = form_class
        self.min_count = min_count
        self.max_count = max_count

    def clean(self, values):
        if len(values) < self.min_count:
            raise ValidationError(
                'There needs to be at least '
                f'{self.min_count} item/s.')

        if self.max_count and len(values) > self.max_count:
            raise ValidationError(
                'There needs to be at most '
                f'{self.max_count} item/s.')

        item_forms = []
        for index, item in enumerate(values):
            item_form = self.form_class(item)
            if not item_form.is_valid():
                raise ValidationError(
                    f'[{index}]: {repr(item_form.errors)}')
            item_forms.append(item_form)

        return item_forms
```

And to use

```python
class PersonForm(forms.Form):
    name = forms.CharField()


class UpdateOrganizationService(Service):
    organization = forms.ModelChoiceField(
        queryset=Organization.objects.all())
    people = MultipleFormField(PersonForm)

    def process(self):
        organization = self.cleaned_data['organization']
        people = self.cleaned_data['people']

        # `people` is a list of Form objects
        for person in people:
            organization.people.add(
                Person(name=person.cleaned_data['name']))

        organization.save()


org = Organization.objects.get()
UpdateOrganizationService.execute({
    'organization': org,
    'people': [{
        'name': 'Mitchel Cabuloy',
    }, {
        'name': 'Amanda Lim',
    }],
})
```

## Conclusion

Projects get complicated fast, and just putting your business logic in views and models will leave you in a world of hurt. Service objects help by decoupling your business logic from your presentation logic making it easier to test plus have the bonus of input validation.

For now I'll leave you with [a gist](https://gist.github.com/mixxorz/367df56cde603bd31e12c809b7e2217a) with everything you need, but I'm planning to release a library soon so you can just `import Service`.

🍻
