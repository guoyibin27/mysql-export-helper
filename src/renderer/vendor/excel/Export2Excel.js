/* eslint-disable */
import col from "element-ui/packages/col/src/col";
import merge from "element-ui/src/utils/merge";

require('script-loader!file-saver');
require('./Blob');
// require('script-loader!xlsx/dist/xlsx.full.min');
require('script-loader!xlsx-style/dist/xlsx.full.min');
const XLSX = require('xlsx-style');

function generateArray(table) {
    var out = [];
    var rows = table.querySelectorAll('tr');
    var ranges = [];
    for (var R = 0; R < rows.length; ++R) {
        var outRow = [];
        var row = rows[R];
        var columns = row.querySelectorAll('td');
        for (var C = 0; C < columns.length; ++C) {
            var cell = columns[C];
            var colspan = cell.getAttribute('colspan');
            var rowspan = cell.getAttribute('rowspan');
            var cellValue = cell.innerText;
            if (cellValue !== "" && cellValue == +cellValue) cellValue = +cellValue;

            //Skip ranges
            ranges.forEach(function (range) {
                if (R >= range.s.r && R <= range.e.r && outRow.length >= range.s.c && outRow.length <= range.e.c) {
                    for (var i = 0; i <= range.e.c - range.s.c; ++i) outRow.push(null);
                }
            });

            //Handle Row Span
            if (rowspan || colspan) {
                rowspan = rowspan || 1;
                colspan = colspan || 1;
                ranges.push({s: {r: R, c: outRow.length}, e: {r: R + rowspan - 1, c: outRow.length + colspan - 1}});
            }
            ;

            //Handle Value
            outRow.push(cellValue !== "" ? cellValue : null);

            //Handle Colspan
            if (colspan) for (var k = 0; k < colspan - 1; ++k) outRow.push(null);
        }
        out.push(outRow);
    }
    return [out, ranges];
};

function datenum(v, date1904) {
    if (date1904) v += 1462;
    var epoch = Date.parse(v);
    return (epoch - new Date(Date.UTC(1899, 11, 30))) / (24 * 60 * 60 * 1000);
}

function sheet_from_array_of_arrays(data, top = 0) {
    var ws = {};
    const colWidth = [];
    var range = {s: {c: 10000000, r: 10000000}, e: {c: 0, r: 0}};
    for (var R = 0; R != data.length; ++R) {
        for (var C = 0; C != data[R].length; ++C) {
            if (range.s.r > R) range.s.r = R;
            if (range.s.c > C) range.s.c = C;
            if (range.e.r < R) range.e.r = R;
            if (range.e.c < C) range.e.c = C;
            let v = data[R][C];
            let cell = {};
            if (typeof v === 'object' && v != null) {
                cell.v = v.v;
                cell.s = v.s;
            } else {
                cell.v = v;
            }

            if (cell.v == null) continue;
            let cellLength = cell.v.length;
            if (isChinese(cell.v)) {
                cellLength = cell.v.length * 2;
            }
            if (colWidth[C]) {
                colWidth[C] = {wch: Math.max(cellLength, colWidth[C].wch)};
            } else {
                colWidth[C] = {wch: cellLength};
            }


            var cell_ref = XLSX.utils.encode_cell({c: C, r: R + top});
            if (typeof cell.v === 'number') cell.t = 'n';
            else if (typeof cell.v === 'boolean') cell.t = 'b';
            else if (cell.v instanceof Date) {
                cell.t = 'n';
                cell.z = XLSX.SSF._table[14];
                cell.v = datenum(cell.v);
            } else cell.t = 's';

            ws[cell_ref] = cell;
        }
    }
    ws["!cols"] = colWidth;
    if (range.s.c < 10000000) ws['!ref'] = XLSX.utils.encode_range(range);
    return ws;
}

function isChinese(str) {
    var patrn = /[\u4E00-\u9FA5]|[\uFE30-\uFFA0]/gi;
    return patrn.exec(str);
}

function Workbook() {
    if (!(this instanceof Workbook)) return new Workbook();
    this.SheetNames = [];
    this.Sheets = {};
}

function s2ab(s) {
    var buf = new ArrayBuffer(s.length);
    var view = new Uint8Array(buf);
    for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
}

export function export_table_to_excel(id, sheetName) {
    var theTable = document.getElementById(id);
    console.log('a')
    var oo = generateArray(theTable);
    var ranges = oo[1];

    /* original data */
    var data = oo[0];
    var ws_name = sheetName;
    console.log(data);

    var wb = new Workbook(), ws = sheet_from_array_of_arrays(data);

    /* add ranges to worksheet */
    // ws['!cols'] = ['apple', 'banan'];
    ws['!merges'] = ranges;

    /* add worksheet to workbook */
    wb.SheetNames.push(ws_name);
    wb.Sheets[ws_name] = ws;

    var wbout = XLSX.write(wb, {bookType: 'xlsx', bookSST: false, type: 'binary'});

    saveAs(new Blob([s2ab(wbout)], {type: "application/octet-stream"}), "test.xlsx")
}

function formatJson(jsonData) {
    console.log(jsonData)
}

export function export_json_to_excel(jsonData, sheetName, defaultTitle, title, th, topOffset) {

    /* original data */

    var data = jsonData.rowData;
    let cellCount = data[0].length;
    if (th != null && th.length !== 0) {
        data.unshift(th);
    }
    if (title != null && title.length !== 0) {
        data.unshift(title);
    }

    var ws_name = sheetName;

    if (!topOffset) {
        topOffset = 0;
    }
    var wb = new Workbook(), ws = sheet_from_array_of_arrays(data, topOffset);

    let mergesArray = [];
    if (title != null && title.length !== 0) {
        mergesArray.push({
            s: {c: 0, r: 0},
            e: {c: cellCount - 1, r: 0}
        });
        ws["A1"].s = {
            font: {
                name: "宋体",
                sz: 14,
            },
            alignment: {
                horizontal: "center",
                vertical: "center"
            }
        }
    }
    mergesArray = mergesArray.concat(jsonData.mergeData);
    console.error(mergesArray);
    ws["!merges"] = mergesArray;

    /* add worksheet to workbook */
    wb.SheetNames.push(ws_name);
    wb.Sheets[ws_name] = ws;

    var wbout = XLSX.write(wb, {bookType: 'xlsx', bookSST: true, type: 'binary', cellStyles: true});
    var _title = defaultTitle || '列表';
    saveAs(new Blob([s2ab(wbout)], {type: "application/octet-stream"}), _title + ".xlsx")
}
