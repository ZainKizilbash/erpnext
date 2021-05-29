// Copyright (c) 2020, Frappe Technologies Pvt. Ltd. and contributors
// For license information, please see license.txt

frappe.provide("erpnext.vehicles");

erpnext.vehicles.VehicleQuotation = erpnext.vehicles.VehicleBookingController.extend({
	refresh: function () {
		this._super();
		this.set_dynamic_field_label();
		this.set_default_valid_till();
	},

	setup_queries: function () {
		this._super();

		var me = this;

		me.frm.set_query("quotation_to", function () {
			return {
				"filters": {
					"name": ["in", ["Customer", "Lead"]],
				}
			}
		});

		me.frm.set_query("party_name", function () {
			if (me.frm.doc.quotation_to === "Customer") {
				return erpnext.queries.customer();
			} else if (me.frm.doc.quotation_to === "Lead") {
				return erpnext.queries.lead();
			}
		});
	},

	set_default_valid_till: function () {
		if (this.frm.doc.__islocal && !this.frm.doc.valid_till) {
			var valid_days = frappe.boot.sysdefaults.quotation_valid_till;
			if (valid_days) {
				this.frm.set_value('valid_till', frappe.datetime.add_days(this.frm.doc.transaction_date, valid_days));
			} else {
				this.frm.set_value('valid_till', frappe.datetime.add_months(this.frm.doc.transaction_date, 1));
			}
		}
	},

	quotation_to: function () {
		this.set_dynamic_field_label();
		this.frm.set_value("party_name", null);
	},

	party_name: function () {
		this.get_customer_details();
	},

	set_dynamic_field_label: function() {
		if (this.frm.doc.quotation_to) {
			this.frm.set_df_property("party_name", "label", __(this.frm.doc.quotation_to));
			this.frm.set_df_property("customer_address", "label", __(this.frm.doc.quotation_to + " Address"));
			this.frm.set_df_property("contact_person", "label", __(this.frm.doc.quotation_to + " Contact Person"));
		} else {
			this.frm.set_df_property("party_name", "label", __("Party"));
			this.frm.set_df_property("customer_address", "label", __("Party Address"));
			this.frm.set_df_property("contact_person", "label", __("Party Contact Person"));
		}
	},
});

$.extend(cur_frm.cscript, new erpnext.vehicles.VehicleQuotation({frm: cur_frm}));
