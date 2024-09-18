# Generated by Django 5.0.6 on 2024-09-16 09:45

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('location', '0006_averageincome'),
    ]

    operations = [
        migrations.CreateModel(
            name='ClosedBusinessCount',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('subdistrict', models.CharField(max_length=255)),
                ('district', models.CharField(max_length=255)),
                ('province', models.CharField(max_length=255)),
                ('count', models.IntegerField()),
            ],
        ),
    ]
