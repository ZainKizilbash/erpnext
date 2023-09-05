# Copyright (c) 2023, Frappe Technologies Pvt. Ltd. and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from erpnext.vehicles.vehicle_transaction_controller import VehicleTransactionController

class VehicleNumberPlateDelivery(VehicleTransactionController):
	def validate(self):
		super(VehicleNumberPlateDelivery, self).validate()

		self.validate_duplicate_number_plate_delivery()
		self.set_vehicle_registration_order()
		self.validate_vehicle_registration_order()
		self.set_title()

	def on_submit(self):
		self.update_vehicle_registration_order()

	def on_cancel(self):
		self.update_vehicle_registration_order()

	def validate_duplicate_number_plate_delivery(self):
		filters = {
			"vehicle": self.vehicle,
			"docstatus": 1,
			"vehicle_license_plate": self.vehicle_license_plate,
			"name": ['!=', self.name]
		}

		number_plate_delivery = frappe.db.get_value("Vehicle Number Plate Delivery", filters=filters)

		if number_plate_delivery:
			frappe.throw(_("Number Plate for {0} has already been delivered in {1}")
				.format(frappe.get_desk_link("Vehicle", self.vehicle),
				frappe.get_desk_link("Vehicle Number Plate Delivery", number_plate_delivery)))

	def set_title(self):
		self.title = "{0} - {1}".format(self.get('customer_name') or self.get('customer'), self.get('vehicle_license_plate'))

