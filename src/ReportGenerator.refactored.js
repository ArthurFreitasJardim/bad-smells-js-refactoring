export class ReportGenerator {
  constructor(database) {
    this.db = database;
  }

  generateReport(reportType, user, items) {
    const USER_MAX_VALUE = 500;
    const ADMIN_PRIORITY_THRESHOLD = 1000;

    const filteredItems = this.filterItems(user, items, USER_MAX_VALUE, ADMIN_PRIORITY_THRESHOLD);
    const reportBody = this.buildBody(reportType, user, filteredItems, ADMIN_PRIORITY_THRESHOLD);
    const total = filteredItems.reduce((sum, item) => sum + item.value, 0);

    return this.buildReport(reportType, user, reportBody, total);
  }

  filterItems(user, items, USER_MAX_VALUE, ADMIN_PRIORITY_THRESHOLD) {
    if (user.role === 'ADMIN') {
      return items.map(item => ({
        ...item,
        priority: item.value > ADMIN_PRIORITY_THRESHOLD
      }));
    }
    if (user.role === 'USER') {
      return items.filter(item => item.value <= USER_MAX_VALUE);
    }
    return [];
  }

  buildBody(reportType, user, items) {
    if (reportType === 'CSV') {
      return items.map(item => `${item.id},${item.name},${item.value},${user.name}`).join('\n');
    }
    if (reportType === 'HTML') {
      return items.map(item => {
        const style = item.priority ? 'style="font-weight:bold;"' : '';
        const openTag = item.priority ? `<tr ${style}>` : '<tr>';
        return `${openTag}<td>${item.id}</td><td>${item.name}</td><td>${item.value}</td></tr>`;
      }).join('\n');
    }
    return '';
  }

  buildReport(reportType, user, body, total) {
    if (reportType === 'CSV') {
      return `ID,NOME,VALOR,USUARIO\n${body}\nTotal,,\n${total},,`;
    }
    if (reportType === 'HTML') {
      return `<html><body>
<h1>Relatório</h1>
<h2>Usuário: ${user.name}</h2>
<table>
<tr><th>ID</th><th>Nome</th><th>Valor</th></tr>
${body}
</table>
<h3>Total: ${total}</h3>
</body></html>`;
    }
    return '';
  }
}
