// Copyright (c) 2015, Frappe Technologies Pvt. Ltd. and Contributors
// License: GNU General Public License v3. See license.txt


frappe.query_reports["Employee Checkin Sheet"] = {
	filters: [
		{
			fieldname: "company",
			label: __("Company"),
			fieldtype: "Link",
			options: "Company",
			default: frappe.defaults.get_user_default("Company"),
			reqd: 1
		},
		{
			fieldname: "from_date",
			label: __("From Date"),
			fieldtype: "Date",
			default: frappe.datetime.add_months(frappe.datetime.month_start(), -1),
			reqd: 1
		},
		{
			fieldname: "to_date",
			label: __("To Date"),
			fieldtype: "Date",
			default: frappe.datetime.add_days(frappe.datetime.month_start(), -1),
			reqd: 1
		},
		{
			fieldname: "employee",
			label: __("Employee"),
			fieldtype: "Link",
			options: "Employee",
			on_change: () => {
				var employee = frappe.query_report.get_filter_value('employee');
				if (employee) {
					frappe.db.get_value('Employee', employee, "employee_name", function(value) {
						frappe.query_report.set_filter_value('employee_name', value["employee_name"]);
					});
					frappe.db.get_value('Employee', employee, "designation", function(value) {
						frappe.query_report.set_filter_value('designation', value["designation"]);
					});
					frappe.db.get_value('Employee', employee, "department", function(value) {
						frappe.query_report.set_filter_value('department', value["department"]);
					});
				} else {
					frappe.query_report.set_filter_value('employee_name', "");
					frappe.query_report.set_filter_value('designation', "");
					frappe.query_report.set_filter_value('department', "");
				}
			},
		},
		{
			fieldname: "employee_name",
			label: __("Employee Name"),
			fieldtype: "Data",
			on_change: () => { return false },
			"hidden": 1
		},
		{
			fieldname: "designation",
			label: __("Designation"),
			fieldtype: "Data",
			on_change: () => { return false },
			"hidden": 1
		},
		{
			fieldname: "department",
			label: __("Department"),
			fieldtype: "Data",
			on_change: () => { return false },
			"hidden": 1
		}
	],

	formatter: function(value, row, column, data, default_formatter) {
		var style = {};
		var link;

		if (['attendance_status', 'attendance_abbr'].includes(column.fieldname)) {
			var status = data['attendance_status'];

			if (status == "Holiday") {
				style['font-weight'] = 'bold';
			}

			if (status == "Present") {
				style['color'] = 'green';
			}
			if (status == "Absent") {
				style['color'] = 'red';
			}
			if (status == "Half Day") {
				style['color'] = 'orange';
			}
			if (status == "On Leave") {
				style['color'] = 'blue';
			}
		}

		if (['attendance_status', 'attendance_abbr', 'working_hours'].includes(column.fieldname)) {
			if (data['attendance']) {
				link = "/app/attendance/" + encodeURIComponent(data['attendance']);
			} else if (status != "Holiday") {
				style['opacity'] = '0.6';
			}
		}

		if (column.checkin_idx) {
			var checkin_name = data['checkin_' + column.checkin_idx];
			if (checkin_name) {
				link = "/app/employee-checkin/" + encodeURIComponent(checkin_name);
			}
		}

		return default_formatter(value, row, column, data, {css: style, link_href: link, link_target: "_blank"});
	},
}
