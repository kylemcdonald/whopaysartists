var currencySymbols = {'USD': '$', 'EUR': '€', 'GBP': '£', 'JPY': '¥'};
var monthNames = [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ];

function printReport(report) {
	out = '<p>I was paid';
	if(report.fee == 0) { 
		out += ' nothing'
	} else if(report.fee) {
		var currencySymbol = currencySymbols[report.currency];
		out += ' ' + currencySymbol + report.fee;
	}
	if(report.client) out += ' by ' + report.client;
	if(report.job) out += ' for a ' + report.job;
	if(report.where) out += ' in ' + report.where;
	out += '.</p>';

	if(report.time_amount) {
		var unit = (report.time_amount > 1 ? report.time_unit : report.time_unit.slice(0, -1));
		out += '<p>It took ' + report.time_amount + ' ' + unit + ' of work';
		if(report.experience) {
			out += ', and I had a ' + report.experience + ' experience';
		}
		out += '.</p>';
	} else if(report.experience) {
		out += '<p>I had a ' +  report.experience + ' experience.</p>';
	}

	var hasGender = report.gender && report.gender != 'person';
	var hasMedium = Boolean(report.medium);
	var hasWorkingYears = report.working_years || report.working_years == 0;
	if(hasGender || hasMedium || hasWorkingYears) {
		out += '<p>I';
		if(hasGender) {
			out += ' am a ' + report.gender;
			if(hasMedium || hasWorkingYears) {
				out += ', and';
			}
		}
		if(hasWorkingYears) {
			out += ' have been doing ' + (hasMedium ? report.medium : 'this' + ' for');
			if(report.working_years == 0) {
				out += ' less than a year';
			} else {
				out += ' ' + report.working_years + ' ' + (report.working_years > 1 ? 'years' : 'year');
			}
		} else if(hasMedium) {
			out += ' do ' + report.medium;
		}
		out += '.</p>';
	}

	if (report.also) {
	  out += '<p>Also: ' + report.also + '</p>';
	}
 
 	out += '<p class="date"><a href="' + report._id + '"">Submitted in ' + report.time_of_month + ' ' + monthNames[report.month] + ' ' + report.year + '</a></p>';

	return out;
}

