# Generated by Django 5.0.6 on 2024-09-12 08:45

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0008_activitylog_ip_address_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='onetimepassword',
            name='expires_at',
            field=models.DateTimeField(default=datetime.datetime(2024, 9, 12, 8, 47, 34, 790177, tzinfo=datetime.timezone.utc)),
        ),
    ]
