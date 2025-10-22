export function exportToCsv(filename: string, rows: Array<Record<string, unknown>>) {
	if (!rows.length) return;
	const headers = Object.keys(rows[0]);
	const lines = [headers.join(',')].concat(
		rows.map((r) => headers.map((h) => JSON.stringify(r[h] ?? '')).join(','))
	);
	const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
	const link = document.createElement('a');
	const url = URL.createObjectURL(blob);
	link.setAttribute('href', url);
	link.setAttribute('download', filename);
	link.style.visibility = 'hidden';
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
}
