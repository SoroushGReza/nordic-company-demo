# Generated by Django 4.2.15 on 2024-09-05 09:56

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("bookings", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="Availability",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("date", models.DateField()),
                ("start_time", models.TimeField()),
                ("end_time", models.TimeField()),
                ("is_available", models.BooleanField(default=True)),
            ],
        ),
    ]
