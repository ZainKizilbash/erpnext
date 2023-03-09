// Copyright (c) 2020, Frappe Technologies Pvt. Ltd. and contributors
// For license information, please see license.txt

frappe.ui.form.on('Vehicles Settings', {
	default_service_cr: function(frm) {
		if (!frm.doc.default_service_cr) {
			frm.set_value('default_service_cr_name', null);
		}
	}
});
