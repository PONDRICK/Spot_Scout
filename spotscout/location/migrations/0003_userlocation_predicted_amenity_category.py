# Generated by Django 5.0.6 on 2024-06-18 08:56

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('location', '0002_userlocation'),
    ]

    operations = [
        migrations.AddField(
            model_name='userlocation',
            name='predicted_amenity_category',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
    ]
