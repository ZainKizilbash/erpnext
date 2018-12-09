// Copyright (c) 2016, Frappe Technologies Pvt. Ltd. and contributors
// For license information, please see license.txt
/* eslint-disable */

frappe.query_reports["Sales Analytics"] = {
	"filters": [
		{
			fieldname: "tree_type",
			label: __("Tree Type"),
			fieldtype: "Select",
			options: ["Customer Group","Customer","Item Group","Item","Brand","Territory","Sales Person"],
			default: "Customer",
			reqd: 1
		},
		{
			fieldname: "doctype",
			label: __("Based On"),
			fieldtype: "Select",
			options: ["Sales Order","Delivery Note","Sales Invoice"],
			default: "Sales Invoice",
			reqd: 1
		},
		{
			fieldname: "value_field",
			label: __("Value Or Qty"),
			fieldtype: "Select",
			options: [
				{ "value": "base_net_amount", "label": __("Net Amount") },
				{ "value": "base_amount", "label": __("Amount") },
				{ "value": "stock_qty", "label": __("Stock Qty") },
				{ "value": "alt_uom_qty", "label": __("Contents Qty") },
				{ "value": "qty", "label": __("Transaction Qty") },
			],
			default: "base_net_amount",
			reqd: 1
		},
		{
			fieldname: "from_date",
			label: __("From Date"),
			fieldtype: "Date",
			default: frappe.defaults.get_user_default("year_start_date"),
			reqd: 1
		},
		{
			fieldname:"to_date",
			label: __("To Date"),
			fieldtype: "Date",
			default: frappe.defaults.get_user_default("year_end_date"),
			reqd: 1
		},
		{
			fieldname: "company",
			label: __("Company"),
			fieldtype: "Link",
			options: "Company",
			default: frappe.defaults.get_user_default("Company"),
			reqd: 1
		},
		{
			fieldname: "range",
			label: __("Range"),
			fieldtype: "Select",
			options: [
				{ "value": "Weekly", "label": __("Weekly") },
				{ "value": "Monthly", "label": __("Monthly") },
				{ "value": "Quarterly", "label": __("Quarterly") },
				{ "value": "Yearly", "label": __("Yearly") }
			],
			default: "Monthly",
			reqd: 1
		},
		{
			fieldname: "customer",
			label: __("Customer"),
			fieldtype: "Link",
			options: "Customer"
		},
		{
			fieldname: "customer_group",
			label: __("Customer Group"),
			fieldtype: "Link",
			options: "Customer Group"
		},
		{
			fieldname: "item_code",
			label: __("Item"),
			fieldtype: "Link",
			options: "Item"
		},
		{
			fieldname: "item_group",
			label: __("Item Group"),
			fieldtype: "Link",
			options: "Item Group"
		},
		{
			fieldname: "brand",
			label: __("Brand"),
			fieldtype: "Link",
			options: "Brand"
		},
		{
			fieldname: "territory",
			label: __("Territory"),
			fieldtype: "Link",
			options: "Territory"
		},
		{
			fieldname: "sales_person",
			label: __("Sales Person"),
			fieldtype: "Link",
			options: "Sales Person"
		}
	],
	after_datatable_render: function(datatable_obj) {
		$(datatable_obj.wrapper).find(".dt-row-0").find('input[type=checkbox]').click();
	},
	get_datatable_options(options) {
		return Object.assign(options, {
			checkboxColumn: true,
			events: {
				onCheckRow: function(data) {
					let row_name = data[2].content;
					let period_columns = [];
					$.each(frappe.query_report.columns || [], function(i, column) {
						if (column.period_column) {
							period_columns.push(i+2);
						}
					});

					let row_values = period_columns.map(i => data[i].content);
					let entry = {
						'name':row_name,
						'values':row_values
					};

					let raw_data = frappe.query_report.chart.data;
					let new_datasets = raw_data.datasets;

					let found = false;

					for(var i=0; i < new_datasets.length;i++){
						if(new_datasets[i].name == row_name){
							found = true;
							new_datasets.splice(i,1);
							break;
						}
					}

					if(!found){
						new_datasets.push(entry);
					}

					let new_data = {
						labels: raw_data.labels,
						datasets: new_datasets
					};

					setTimeout(() => {
						frappe.query_report.chart.update(new_data)
					}, 500);


					setTimeout(() => {
						frappe.query_report.chart.draw(true);
					}, 1000);

					frappe.query_report.raw_chart_data = new_data;
				},
			}
		})
	},
}


