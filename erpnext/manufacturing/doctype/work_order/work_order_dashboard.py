from frappe import _


def get_data():
	return {
		'fieldname': 'work_order',
		'transactions': [
			{
				'label': _('Fulfilment'),
				'items': ['Stock Entry']
			},
			{
				'label': _("Operations"),
				'items': ['Job Card']
			},
			{
				'label': _("Packing"),
				'items': ['Packing Slip']
			},
			{
				'label': _('Stock'),
				'items': ['Pick List']
			},
		]
	}
