# Generated by Django 4.2.13 on 2024-10-01 11:07

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('location', '0012_alter_location_id'),
    ]

    operations = [
        migrations.AddField(
            model_name='location',
            name='source_id',
            field=models.BigIntegerField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='location',
            name='id',
            field=models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID'),
        ),
    ]
