# -*- coding: utf-8 -*-
# Copyright (c) 2015, Frappe Technologies Pvt. Ltd. and Contributors
# See license.txt

import frappe
import unittest
from frappe.utils import nowdate,flt, cstr,random_string

class TestVehicleLog(unittest.TestCase):
	def test_make_vehicle_log_and_syncing_of_odometer_value(self):
		employee_id = frappe.db.sql("""select name from `tabEmployee` where status='Active' order by modified desc limit 1""")
		employee_id = employee_id[0][0] if employee_id else None

		license_plate = get_vehicle(employee_id)

		vehicle_log = frappe.get_doc({
			"doctype": "Vehicle Log",
			"license_plate": cstr(license_plate),
			"employee":employee_id,
			"date":frappe.utils.nowdate(),
			"odometer":5010,
			"fuel_qty":frappe.utils.flt(50),
			"price": frappe.utils.flt(500)
		})
		vehicle_log.save()
		vehicle_log.submit()

		#checking value of vehicle odometer value on submit.
		vehicle = frappe.get_doc("Vehicle", license_plate)
		self.assertEqual(vehicle.last_odometer, vehicle_log.odometer)

		#checking value vehicle odometer on vehicle log cancellation.
		last_odometer = vehicle_log.last_odometer
		current_odometer = vehicle_log.odometer
		distance_travelled = current_odometer - last_odometer

		vehicle_log.cancel()
		vehicle.reload()

		self.assertEqual(vehicle.last_odometer, current_odometer - distance_travelled)


def get_vehicle(employee_id):
	license_plate=random_string(10).upper()
	vehicle = frappe.get_doc({
			"doctype": "Vehicle",
			"license_plate": cstr(license_plate),
			"make": "Maruti",
			"model": "PCM",
			"employee": employee_id,
			"last_odometer":5000,
			"acquisition_date":frappe.utils.nowdate(),
			"location": "Mumbai",
			"chassis_no": "1234ABCD",
			"uom": "Litre",
			"vehicle_value":frappe.utils.flt(500000)
		})
	try:
		vehicle.insert()
	except frappe.DuplicateEntryError:
		pass
	return license_plate