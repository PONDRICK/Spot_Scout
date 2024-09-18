# Generated by Django 5.0.6 on 2024-09-12 08:45

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('location', '0004_userlocation_count_apartment_within_500m_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='BusinessOwnerCount',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('subdistrict', models.CharField(max_length=255)),
                ('district', models.CharField(max_length=255)),
                ('province', models.CharField(max_length=255)),
                ('count', models.IntegerField()),
            ],
        ),
    ]
