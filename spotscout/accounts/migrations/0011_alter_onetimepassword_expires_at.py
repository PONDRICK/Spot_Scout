# Generated by Django 4.2.13 on 2024-09-13 10:40

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0010_alter_onetimepassword_expires_at'),
    ]

    operations = [
        migrations.AlterField(
            model_name='onetimepassword',
            name='expires_at',
            field=models.DateTimeField(default=datetime.datetime(2024, 9, 13, 10, 43, 24, 227822, tzinfo=datetime.timezone.utc)),
        ),
    ]
