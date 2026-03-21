---
title: Email Notifications
description: Configure email notifications for appointments.
---

WP Appointments sends email notifications for key appointment events.

## Notification Events

| Event | Recipient | Description |
|-------|-----------|-------------|
| **Appointment Confirmed** | Customer | Sent when an appointment is confirmed |
| **Appointment Cancelled** | Customer | Sent when an appointment is cancelled |
| **Appointment Reminder** | Customer | Sent before the appointment |
| **New Booking** | Admin | Sent when a new appointment is created |

## Template Variables

Email templates support variables that are replaced with actual values:

| Variable | Description |
|----------|-------------|
| `{customer_name}` | Customer's full name |
| `{appointment_date}` | Appointment date |
| `{appointment_time}` | Appointment time |
| `{service_name}` | Booked service name |

## Configuration

Go to **WP Appointments → Settings → Notifications** to customize email templates and toggle notifications on/off.
