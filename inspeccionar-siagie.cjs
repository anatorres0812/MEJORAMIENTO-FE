const ExcelJS = require('exceljs');

async function main() {
  const libro = new ExcelJS.Workbook();

  await libro.xlsx.readFile(
    'src/assets/plantillas/plantilla-siagie.xlsx'
  );

  for (const hoja of libro.worksheets) {
    console.log('\n====================================');
    console.log('HOJA:', hoja.name);
    console.log('Filas:', hoja.rowCount);
    console.log('Columnas:', hoja.columnCount);
    console.log('====================================');

    hoja.eachRow({ includeEmpty: false }, (fila, numero) => {
      const valores = fila.values
        .slice(1)
        .map((valor) => {
          if (valor && typeof valor === 'object') {
            if (Array.isArray(valor.richText)) {
              return valor.richText.map(x => x.text).join('');
            }
            if ('result' in valor) return valor.result ?? '';
            if ('text' in valor) return valor.text ?? '';
          }
          return valor ?? '';
        });

      console.log(numero, JSON.stringify(valores));
    });
  }
}

main().catch(error => {
  console.error('Error leyendo la plantilla:', error.message);
  process.exitCode = 1;
});
