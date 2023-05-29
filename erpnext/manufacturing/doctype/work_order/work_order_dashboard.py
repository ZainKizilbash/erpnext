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
				'label': _('Stock'),
				'items': ['Pick List']
			},
			{
				'label': _("Operations"),
				'items': ['Job Card']
			}
		]
	}