// Copyright (c) 2021, Frappe Technologies Pvt. Ltd. and contributors
// For license information, please see license.txt

frappe.provide("erpnext.vehicles");
erpnext.vehicles.VehicleTransferLetterController = erpnext.vehicles.VehicleTransactionController.extend({
	refresh: function () {
		this._super();
	},

	setup_queries: function () {
		this._super();

		this.frm.set_query("vehicle_booking_order", function() {
			return {
				filters: {
					status: ['!=', 'Cancelled Booking'],
					docstatus: 1,
				}
			};
		});
	},

	vehicle: function () {
		this._super();
		this.warn_vehicle_reserved_by_sales_person();
	},

	sales_person: function () {
		this.warn_vehicle_reserved_by_sales_person();
	},

	warn_vehicle_reserved_by_sales_person: function () {
		if (this.frm.doc.vehicle && this.frm.doc.sales_person) {
			frappe.call({
				method: "erpnext.vehicles.doctype.vehicle.vehicle.warn_vehicle_reserved_by_sales_person",
				args: {
					vehicle: this.frm.doc.vehicle,
					sales_person: this.frm.doc.sales_person
				}
			})
		}
	}
});

$.extend(cur_frm.cscript, new erpnext.vehicles.VehicleTransferLetterController({frm: cur_frm}));
