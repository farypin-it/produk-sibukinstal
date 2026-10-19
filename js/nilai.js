// ==========================================
// PENGELOLAAN MATA PELAJARAN & NILAI AI
// ==========================================

function pilihanSikap(selected) {
    return `<option value="">- Pilih -</option><option value="A" ${selected === 'A' ? 'selected' : ''}>A (Sangat Baik)</option><option value="B" ${selected === 'B' ? 'selected' : ''}>B (Baik)</option><option value="C" ${selected === 'C' ? 'selected' : ''}>C (Cukup)</option><option value="D" ${selected === 'D' ? 'selected' : ''}>D (Kurang)</option><option value="E" ${selected === 'E' ? 'selected' : ''}>E (Sangat Kurang)</option>`;
}

function formatNilaiTampil(value) {
    if (value === null || value === undefined || value === '') return '-';
    const number = Number(String(value).replace(',', '.'));
    if (!Number.isFinite(number)) return String(value);
    return number.toFixed(2).replace('.', ',');
}

function formatSikapTampil(value) {
    const labels = { A: 'A (Sangat Baik)', B: 'B (Baik)', C: 'C (Cukup)', D: 'D (Kurang)', E: 'E (Sangat Kurang)' };
    const code = String(value || '').trim().toUpperCase().charAt(0);
    return labels[code] || (value || '-');
}

function parseNilaiInput(value) {
    const number = parseFloat(String(value || '').replace(',', '.'));
    return Number.isFinite(number) ? number : 0;
}

function validateInput(el) {
    el.value = el.value.replace(/[^0-9,.]/g, '').replace('.', ',');
    let val = parseNilaiInput(el.value);
    if (val > 100) { showCoolAlert('Nilai Invalid', 'Maksimal 100!', 'warning'); el.value = ''; return false; }
    if (val < 0) { showCoolAlert('Nilai Invalid', 'Minimal 0!', 'warning'); el.value = ''; return false; }
    if (el.value.includes(',')) {
        if (el.value.split(',')[1].length > 2) {
            showCoolAlert('Format Salah', 'Maks 2 desimal', 'warning');
            el.value = val.toFixed(2).replace('.', ',');
            return false;
        }
    }
    return true;
}

function calc() {
    let sumP = 0, sumK = 0, count = 0;
    $('#tbodyNilai tr').each(function () {
        let elP = $(this).find('.np'); let elK = $(this).find('.nk');
        sumP += parseNilaiInput(elP.val()); sumK += parseNilaiInput(elK.val()); count++;
    });
    $('#footP').text(formatNilaiTampil(sumP)); $('#footK').text(formatNilaiTampil(sumK));
    $('#avgP').text(formatNilaiTampil(count > 0 ? sumP / count : 0)); $('#avgK').text(formatNilaiTampil(count > 0 ? sumK / count : 0));
}

$('#selSiswa').change(function () {
    const nis = $(this).val();
    if (!nis) return;

    $('#tbodyNilai').html('<tr><td colspan="4" class="text-center py-5"><div class="spinner-border text-primary"></div><div class="small mt-2">Mengambil nilai...</div></td></tr>');

    callAPI('getNilaiSiswa', { nis: nis, smt: curSmt }).then(nilais => {
        const tb = $('#tbodyNilai').empty();
        globalMapel.forEach(m => {
            const ex = nilais.find(n => String(n[1]) == String(m[0])) || [];
            const p = formatNilaiTampil(ex[2] || 0);
            const k = formatNilaiTampil(ex[3] || 0);
            const s = ex[4] || '';
            const d = ex[5] || '';

            tb.append(`<tr>
                <td>${m[1]} <input type="hidden" class="mid" value="${m[0]}"></td>
                <td><input type="text" inputmode="decimal" class="form-control text-center np" value="${p}" oninput="validateInput(this)" onchange="calc()"></td>
                <td><input type="text" inputmode="decimal" class="form-control text-center nk" value="${k}" oninput="validateInput(this)" onchange="calc()"></td>
                <td><select class="form-control text-center ns">${pilihanSikap(s)}</select></td>
                <td><input class="form-control nd" value="${d}" placeholder="Opsional"></td>
            </tr>`);
        });
        calc();
    });
});

function simpanNilai() {
    const nis = $('#selSiswa').val();
    if (!nis) return;
    const grades = [];
    $('#tbodyNilai tr').each(function () {
        const id = $(this).find('.mid').val();
        const p = $(this).find('.np').val();
        const k = $(this).find('.nk').val();
        const s = $(this).find('.ns').val();
        const d = $(this).find('.nd').val();
        if (id) grades.push({ id: id, p: p, k: k, s: s, d: d });
    });
    $('#loader').removeClass('hidden');
    callAPI('saveNilai', { nis: nis, semester: curSmt, grades: grades }).then(() => {
        $('#loader').addClass('hidden');
        showCoolAlert('Tersimpan', '', 'success');
    });
}

function openTranskrip(nis) {
    $('#loader').removeClass('hidden');
    callAPI('getTranskripData', { nis: nis }).then(data => {
        $('#loader').addClass('hidden');
        $('#tNamaSiswa').text(data.siswa[2] + " (" + data.siswa[0] + ")");
        $('#tNis').val(data.siswa[0]); $('#tNisn').val(data.siswa[1]);

        // Deteksi Cerdas: Apakah butuh 12 Semester?
        let maxSmt = 6;
        for (let i = 7; i <= 12; i++) { if (data.summary[i].c > 0) { maxSmt = 12; break; } }

        // Render Tabel 1 (Semester 1 - 6)
        let htmlTable = generateTableTranskripHTML(data, 1, 6);

        // Jika SD, tambahkan Tabel 2 (Semester 7 - 12) di bawahnya
        if (maxSmt === 12) {
            htmlTable += `<div class="mt-4 mb-2 d-flex align-items-center justify-content-between border-top pt-3">
                <h6 class="fw-bold text-primary mb-0"><i class="bi bi-layers me-1"></i> Lanjutan: Semester 7 – 12</h6>
                <span class="badge bg-secondary">Jenjang SD / 12 Semester</span>
            </div>`;
            htmlTable += generateTableTranskripHTML(data, 7, 12);
        }

        // Hapus struktur tabel bawaan modal yang lama, timpa dengan tabel dinamis
        $('#mdlTranskrip .table-responsive').html(htmlTable);
        $('#mdlTranskrip').modal('show');
        setTimeout(() => scrollTranskripTable('left'), 250);
    }).catch(err => {
        $('#loader').addClass('hidden');
        showCoolAlert('Gagal', 'Gagal memuat transkrip nilai: ' + (err.message || err), 'error');
    });
}

function scrollTranskripTable(direction) {
    const container = document.querySelector('#mdlTranskrip .table-responsive');
    if (!container) return;
    if (direction === 'left') {
        container.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
        container.scrollTo({ left: container.scrollWidth, behavior: 'smooth' });
    }
}

function exportTranskripFromModal() {
    const nis = $('#tNis').val();
    const namaSiswa = $('#tNamaSiswa').text().split(' (')[0];
    if (!nis) {
        showCoolAlert('Peringatan', 'Data NIS siswa tidak ditemukan.', 'warning');
        return;
    }
    const s = (typeof globalSiswa !== 'undefined' && Array.isArray(globalSiswa)) ? globalSiswa.find(x => x[0] == nis) : null;
    const nisn = s ? s[1] : ($('#tNisn').val() || '-');

    $('#loader').removeClass('hidden');
    callAPI('exportTranskripNilai', { nis: nis, nisn: nisn, nama: namaSiswa }).then(res => {
        $('#loader').addClass('hidden');
        if (res && res.csv) {
            const blob = new Blob([res.csv], { type: 'text/csv' });
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = res.filename || `Transkrip_${namaSiswa}.csv`;
            link.click();
        } else {
            showCoolAlert('Berhasil', 'Data transkrip nilai berhasil diekspor.', 'success');
        }
    }).catch(err => {
        $('#loader').addClass('hidden');
        showCoolAlert('Gagal', err.message || 'Gagal mengekspor transkrip nilai', 'error');
    });
}

// Fungsi Bantuan Pembuat Tabel HTML Dinamis
function generateTableTranskripHTML(data, startSmt, endSmt) {
    let headerSmt = ""; let headerPKS = "";
    for (let i = startSmt; i <= endSmt; i++) {
        let isOdd = (i % 2 !== 0);
        let smtBg = isOdd ? "#1e3a8a" : "#0f2347";
        headerSmt += `<th colspan="3" class="text-center smt-header smt-col-${i}" style="background-color: ${smtBg} !important; color: #ffffff !important; font-weight: 700; border: 1px solid #475569 !important; font-size: 0.88rem; padding: 7px 4px;">Semester ${i}</th>`;
        headerPKS += `<th class="text-center p-subcol" style="background-color: #1e40af !important; color: #ffffff !important; font-weight: 700; border: 1px solid #3b82f6 !important; font-size: 0.78rem; min-width: 48px; padding: 5px 2px;" title="Pengetahuan (Semester ${i})">P</th>
                      <th class="text-center k-subcol" style="background-color: #166534 !important; color: #ffffff !important; border: 1px solid #22c55e !important; font-weight: 700; font-size: 0.78rem; min-width: 48px; padding: 5px 2px;" title="Keterampilan (Semester ${i})">K</th>
                      <th class="text-center s-subcol" style="background-color: #9a3412 !important; color: #ffffff !important; border: 1px solid #f97316 !important; font-weight: 700; font-size: 0.78rem; min-width: 48px; padding: 5px 2px;" title="Sikap (Semester ${i})">S</th>`;
    }

    let html = `<table class="table table-bordered table-hover text-center table-sm small tabel-dinamis align-middle mb-0" id="tblTranskripDinamis_${startSmt}">
        <thead class="table-header-custom">
            <tr class="header-main-row">
                <th rowspan="2" class="align-middle col-mapel-sticky" style="background-color: #0b1329 !important; color: #ffffff !important; border: 1px solid #334155 !important; font-weight: 700; font-size: 0.9rem;">Mata Pelajaran</th>
                ${headerSmt}
            </tr>
            <tr class="header-sub-row">
                ${headerPKS}
            </tr>
        </thead>
        <tbody>`;

    data.transkrip.forEach(r => {
        html += `<tr><td class="text-start fw-semibold col-mapel-sticky">${r.nama}</td>`;
        for (let i = startSmt; i <= endSmt; i++) {
            html += `<td class="smt-col-${i}">${formatNilaiTampil(r.detail[i].p)}</td>
                     <td class="smt-col-${i}">${formatNilaiTampil(r.detail[i].k)}</td>
                     <td class="smt-col-${i}">${formatSikapTampil(r.detail[i].s)}</td>`;
        }
        html += `</tr>`;
    });

    const sums = data.summary;
    html += `</tbody>
        <tfoot class="table-light fw-bold text-primary">
            <tr class="tfoot-row-total">
                <td class="text-end fw-bold col-mapel-sticky">TOTAL NILAI</td>`;
    for (let i = startSmt; i <= endSmt; i++) {
        html += `<td class="smt-col-${i}">${formatNilaiTampil(sums[i].p.toFixed(2))}</td>
                 <td class="smt-col-${i}">${formatNilaiTampil(sums[i].k.toFixed(2))}</td>
                 <td class="smt-col-${i}">-</td>`;
    }
    html += `</tr>
            <tr class="tfoot-row-rata">
                <td class="text-end fw-bold col-mapel-sticky">RATA-RATA</td>`;
    for (let i = startSmt; i <= endSmt; i++) {
        let ap = sums[i].c > 0 ? (sums[i].p / sums[i].c).toFixed(2) : 0;
        let ak = sums[i].c > 0 ? (sums[i].k / sums[i].c).toFixed(2) : 0;
        html += `<td class="smt-col-${i}">${formatNilaiTampil(ap)}</td>
                 <td class="smt-col-${i}">${formatNilaiTampil(ak)}</td>
                 <td class="smt-col-${i}">-</td>`;
    }
    html += `</tr>
        </tfoot>
    </table>`;
    return html;
}

async function cetakTranskrip() {
    const nis = $('#tNis').val();
    const namaSiswa = $('#tNamaSiswa').text().split(' (')[0];
    const s = globalSiswa.find(x => x[0] == nis);
    const nisn = s ? s[1] : '-';

    // PANGGIL POP-UP SEBELUM CETAK
    promptCetak((tempatCetak, tglCetak) => {
        $('#loader').removeClass('hidden');
        $('#loaderText').text('Menyiapkan Pratinjau PDF...');

        // Gunakan tabel dinamis yang dirender pada view modal
        const tabelUtama = $('#mdlTranskrip .table-responsive').html();

        // 1. AMBIL LOGO (Tanpa validasi length agar dipaksa muncul apapun isinya)
        let imgInstansi = $('#headerLogoInstansi').attr('src') || $('#prevLogoInstansi').attr('src') || '';
        let imgSekolah = $('#headerLogoSekolah').attr('src') || $('#prevLogoSekolah').attr('src') || '';

        let alamatSekolah = globalConf.alamat_sekolah ? globalConf.alamat_sekolah.replace(/\n/g, '<br>') : '-';
        let namaKepsek = globalConf.nama_kepsek || '.....................................';
        let nipKepsek = globalConf.nip_kepsek ? 'NIP. ' + globalConf.nip_kepsek : 'NIP. -';

        const html = `
            <div style="font-family: 'Arial', sans-serif; font-size: 8pt; color: #000; background: #fff; padding: 5px; width: 100%; box-sizing: border-box;">
                <style>
                    * { box-sizing: border-box !important; }
                    .tabel-dinamis {
                        width: 100% !important;
                        max-width: 100% !important;
                        border-collapse: collapse !important;
                        text-align: center;
                        font-size: 7.2pt !important;
                        margin-top: 6px;
                        table-layout: fixed !important;
                    }
                    .tabel-dinamis th, .tabel-dinamis td {
                        border: 0.8px solid #000 !important;
                        padding: 2.5px 1px !important;
                        line-height: 1.15;
                        min-width: 0 !important;
                        box-sizing: border-box !important;
                        overflow: hidden !important;
                    }
                    .tabel-dinamis th {
                        font-weight: bold;
                        vertical-align: middle !important;
                    }
                    .col-mapel-sticky {
                        position: static !important;
                        left: auto !important;
                        box-shadow: none !important;
                        width: 19% !important;
                        min-width: 0 !important;
                        max-width: none !important;
                        font-size: 7.2pt !important;
                        white-space: normal !important;
                        word-break: break-word !important;
                        padding-left: 4px !important;
                        background: transparent !important;
                    }
                    .smt-header {
                        font-size: 7.5pt !important;
                        padding: 3px 1px !important;
                        min-width: 0 !important;
                        color: #ffffff !important;
                    }
                    .p-subcol, .k-subcol, .s-subcol {
                        font-size: 6.8pt !important;
                        min-width: 0 !important;
                        width: 4.5% !important;
                        padding: 2px 1px !important;
                        color: #ffffff !important;
                    }
                    .tabel-dinamis td {
                        font-size: 7.2pt !important;
                    }
                    .text-start { text-align: left !important; padding-left: 4px !important; }
                    .text-end { text-align: right !important; padding-right: 4px !important; }
                    .tfoot-row-total td, .tfoot-row-rata td {
                        font-size: 7pt !important;
                        font-weight: bold;
                    }
                    h6 { margin: 8px 0 3px 0; font-size: 8.5pt; font-weight: bold; text-align: left; }
                </style>
                
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 4px; border: none;">
                    <tr>
                        <td width="10%" align="center" style="border: none;">
                            ${imgInstansi ? `<img src="${imgInstansi}" style="width: 65px; height: 65px; object-fit: contain;">` : ''}
                        </td>
                        <td width="80%" style="text-align: center; line-height: 1.2; border: none;">
                            <div style="font-size:12pt; font-weight:bold; text-transform:uppercase; letter-spacing: 0.5px;">${globalConf.nama_instansi || ''}</div>
                            ${globalConf.opd_dinas ? `<div style="font-size:11pt; font-weight:bold; text-transform:uppercase;">${globalConf.opd_dinas}</div>` : ''}
                            <div style="font-size:15pt; font-weight:bold; text-transform:uppercase; margin: 2px 0;">${globalConf.nama_sekolah || ''}</div>
                            <div style="font-size:8.5pt;">${alamatSekolah}</div>
                            <div style="font-size:8pt; margin-top: 2px;">Telp: ${globalConf.telp_sekolah || '-'} | Email: ${globalConf.email_sekolah || '-'} | Web: ${globalConf.web_sekolah || '-'}</div>
                        </td>
                        <td width="10%" align="center" style="border: none;">
                            ${imgSekolah ? `<img src="${imgSekolah}" style="width: 65px; height: 65px; object-fit: contain;">` : ''}
                        </td>
                    </tr>
                </table>
                <div style="border-bottom: 3px double #000; margin: 3px 0 10px 0;"></div>
                
                <div style="text-align:center; font-weight:bold; margin:6px 0 8px 0; font-size:12pt;">TRANSKRIP NILAI KOMPREHENSIF</div>
                
                <table style="width:100%; margin-bottom:8px; font-size:8.5pt;">
                    <tr>
                        <td width="15%">Nama Siswa</td><td>: <b style="text-transform: uppercase;">${namaSiswa}</b></td>
                        <td width="15%" style="text-align:right;">NIS / NISN </td><td>: <b>${nis} / ${nisn}</b></td>
                    </tr>
                </table>
                
                ${tabelUtama}
                
                <br>
                <table style="width: 100%; border: none; margin-top: 10px;">
                    <tr>
                        <td width="65%" style="border: none;"></td>
                        <td width="35%" style="border: none; text-align: center; font-size: 9.5pt;">
                            ${tempatCetak}, ${tglCetak}<br>
                            Kepala Sekolah<br><br><br><br><br>
                            <b><u>${namaKepsek}</u></b><br>
                            ${nipKepsek}
                        </td>
                    </tr>
                </table>
            </div>
        `;

        var opt = {
            margin: [0.8, 0.8, 0.8, 0.8],
            filename: 'Transkrip_' + (namaSiswa || 'Siswa').trim().replace(/[/\\?%*:|"<>]/g, '_') + '.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, scrollY: 0, windowY: 0, windowWidth: 1280, logging: false },
            jsPDF: { unit: 'cm', format: 'legal', orientation: 'landscape' }
        };
        setTimeout(() => {
            html2pdf().set(opt).from(html).toPdf().get('pdf').then(function(pdf) {
                let blobUrl = pdf.output('bloburl');
                $('#pdfPreviewFrame').attr('src', blobUrl);
                $('#btnOpenPdf').attr('href', blobUrl);
                $('#btnDownloadPdf').off('click').on('click', function() {
                    pdf.save(opt.filename);
                });
                $('#mdlPdfPreview').modal('show');
                $('#loader').addClass('hidden');
                $('#loaderText').text('Memuat Data...');
            });
        }, 500);
    });
}

function loadMapel() {
    $('#tbodyMapel').html('<tr><td colspan="3" class="text-center py-4 text-muted"><div class="spinner-border spinner-border-sm text-primary me-2"></div> Memuat data mata pelajaran...</td></tr>');
    return callAPI('getMapel').then(d => {
        const list = Array.isArray(d) ? d : (d && Array.isArray(d.data) ? d.data : []);
        globalMapel = list;
        renderMapelTable(list);
    }).catch(err => {
        console.error('[Mapel] Gagal memuat mapel:', err);
        $('#tbodyMapel').html(`<tr><td colspan="3" class="text-center text-danger py-4">Gagal memuat mata pelajaran: ${err.message || err}</td></tr>`);
    });
}

function renderMapelTable(d) {
    if ($.fn.DataTable.isDataTable('#tblMapel')) {
        $('#tblMapel').DataTable().clear().destroy();
    }
    const tb = $('#tbodyMapel').empty();
    const list = Array.isArray(d) ? d : (d && Array.isArray(d.data) ? d.data : []);

    if (list.length === 0) {
        tb.html('<tr><td colspan="3" class="text-center text-muted py-4">Belum ada data mata pelajaran. Silakan klik tombol "Tambah Mapel" atau "Import Excel" di atas.</td></tr>');
        return;
    }

    list.forEach(m => {
        const idVal = Array.isArray(m) ? m[0] : (m.id || '');
        const nmVal = Array.isArray(m) ? m[1] : (m.nm || m.nama || '');
        if (!idVal && !nmVal) return;

        const safeId = escapeHTML(String(idVal));
        const safeNm = escapeHTML(String(nmVal));
        const escIdAttr = String(idVal).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
        const escNmAttr = String(nmVal).replace(/\\/g, '\\\\').replace(/'/g, "\\'");

        tb.append(`<tr>
            <td class="fw-bold">${safeId}</td>
            <td>${safeNm}</td>
            <td>
                <button type="button" class="btn btn-sm btn-warning me-1 shadow-sm" onclick="editMapel('${escIdAttr}','${escNmAttr}')" title="Edit Mapel"><i class="bi bi-pencil"></i></button>
                <button type="button" class="btn btn-sm btn-danger shadow-sm" onclick="delMapel('${escIdAttr}')" title="Hapus Mapel"><i class="bi bi-trash"></i></button>
            </td>
        </tr>`);
    });

    $('#tblMapel').DataTable({
        pageLength: 25,
        language: {
            search: 'Cari:',
            lengthMenu: '_MENU_ data',
            info: '_START_-_END_ dari _TOTAL_',
            emptyTable: 'Data Kosong'
        }
    });
}

function editMapel(id, nm) { $('#oldIdMapel').val(id); $('#idMapel').val(id); $('#nmMapel').val(nm); $('#mdlMapel').modal('show'); }
function modalMapel() { $('#formMapel')[0].reset(); $('#oldIdMapel').val(''); $('#lblModalMapel').text('Tambah Mapel'); $('#mdlMapel').modal('show'); }

function showImportMapelModal() {
    $('#fileImportMapel').val('');
    $('#mdlImportMapel').modal('show');
}

function downloadTemplateMapel() {
    downloadTemplate('mapel');
}

function prosesImportMapel() {
    const file = $('#fileImportMapel')[0].files[0];
    if (!file) return showCoolAlert('Gagal', 'Pilih file Excel terlebih dahulu', 'error');
    
    $('#mdlImportMapel').modal('hide');
    $('#loader').removeClass('hidden');
    
    const fileName = (file.name || '').toLowerCase();
    const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');

    const cleanCsvCell = (val) => {
        let s = String(val === undefined || val === null ? '' : val).trim();
        if (s.includes('"') || s.includes(',') || s.includes('\n') || s.includes('\r') || s.includes(';')) {
            return '"' + s.replace(/"/g, '""') + '"';
        }
        return s;
    };

    const handleImport = (csvData) => {
        callAPI('importMapelBulk', { csvData: csvData }).then(res => {
            $('#loader').addClass('hidden');
            if (res.status === 'success') {
                showCoolAlert('Berhasil', res.message, 'success');
                loadMapel();
            } else {
                showCoolAlert('Gagal', res.message, 'error');
            }
        }).catch(err => {
            $('#loader').addClass('hidden');
            showCoolAlert('Gagal', (err && err.message) || 'Gagal memproses file', 'error');
        });
    };

    if (isExcel) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const workbook = XLSX.read(new Uint8Array(e.target.result), { type: 'array' });
                const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
                if (!rows || rows.length < 2) {
                    $('#loader').addClass('hidden');
                    return showCoolAlert('Gagal', 'File Excel kosong atau tidak memiliki data mata pelajaran!', 'error');
                }
                const validRows = rows.filter(r => r && r.length > 0 && r.some(c => String(c).trim() !== ''));
                const csvData = validRows.map(r => r.map(cleanCsvCell).join(',')).join('\r\n');
                handleImport(csvData);
            } catch (err) {
                $('#loader').addClass('hidden');
                showCoolAlert('Gagal', 'Gagal membaca file Excel: ' + err.message, 'error');
            }
        };
        reader.readAsArrayBuffer(file);
    } else {
        const reader = new FileReader();
        reader.onload = function(e) {
            handleImport(e.target.result);
        };
        reader.readAsText(file);
    }
}

function delMapel(id) {
    Swal.fire({ title: 'Hapus Mapel?', text: "Yakin?", icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33' }).then(r => {
        if (r.isConfirmed) callAPI('deleteMapel', { id: id }).then(loadMapel);
    });
}

function saveMapel(e) {
    e.preventDefault();
    $('#loader').removeClass('hidden');
    callAPI('saveMapel', { id: $('#idMapel').val(), nm: $('#nmMapel').val(), old: $('#oldIdMapel').val() }).then(r => {
        $('#loader').addClass('hidden');
        if (r.status == 'success') {
            $('#mdlMapel').modal('hide');
            showCoolAlert('Berhasil', 'Mapel Tersimpan', 'success');
            loadMapel();
        } else showCoolAlert('Gagal', r.message, 'error');
    });
}

function importNilai(inpt) {
    if (!inpt.files || !inpt.files[0]) return;
    const file = inpt.files[0];
    const fileName = (file.name || '').toLowerCase();
    const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');

    if (isExcel) {
        const r = new FileReader();
        r.onload = e => {
            try {
                const workbook = XLSX.read(new Uint8Array(e.target.result), { type: 'array' });
                const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                const csvData = XLSX.utils.sheet_to_csv(worksheet);
                $('#loader').removeClass('hidden');
                callAPI('importNilaiBulk', { csvData: csvData, smt: curSmt }).then(res => {
                    $('#loader').addClass('hidden');
                    showCoolAlert(res.status, res.message, res.status);
                    if ($('#selSiswa').val()) $('#selSiswa').change();
                });
            } catch (err) {
                showCoolAlert('Gagal', 'Format Excel tidak valid: ' + err.message, 'error');
            }
        };
        r.readAsArrayBuffer(file);
    } else {
        const r = new FileReader();
        r.onload = e => {
            $('#loader').removeClass('hidden');
            callAPI('importNilaiBulk', { csvData: e.target.result, smt: curSmt }).then(res => {
                $('#loader').addClass('hidden');
                showCoolAlert(res.status, res.message, res.status);
                if ($('#selSiswa').val()) $('#selSiswa').change();
            });
        };
        r.readAsText(file);
    }
}

function exportTranskrip() {
    const nis = $('#selSiswa').val();
    if (!nis) { showCoolAlert('Pilih Siswa', '', 'warning'); return; }
    const nama = $('#selSiswa option:selected').text().split(" - ")[1];

    // PERBAIKAN BUG A: Cari data siswa di memori untuk mendapatkan NISN
    const s = globalSiswa.find(x => x[0] == nis);
    const nisn = s ? s[1] : '-';

    $('#loader').removeClass('hidden');
    callAPI('exportTranskripNilai', { nis: nis, nisn: nisn, nama: nama }).then(res => {
        $('#loader').addClass('hidden');
        const blob = new Blob([res.csv], { type: 'text/csv' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = res.filename;
        link.click();
    });
}

// 1. Eksekusi Analisis Nilai
function mintaAnalisisAI() {
    const nis = $('#tNis').val();
    const namaSiswa = $('#tNamaSiswa').text().split(' (')[0];

    $('#boxAnalisisAI').removeClass('hidden');
    $('#hasilAnalisisAI').html('<div class="spinner-border spinner-border-sm text-primary"></div> AI sedang membaca dan menganalisis nilai...');

    // Kita panggil API untuk mengambil transkrip dulu, lalu teruskan ke AI
    callAPI('getTranskripData', { nis: nis }).then(data => {
        callAPI('analyzeNilai', { nama: namaSiswa, transkrip: data.transkrip }).then(res => {
            if (res.status === 'success') {
                // Konversi markdown sederhana ke HTML agar tampil rapi
                const htmlText = res.hasilAI.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
                $('#hasilAnalisisAI').html(htmlText);
            } else {
                $('#hasilAnalisisAI').text('Gagal memproses AI: ' + res.message);
            }
        });
    });
}

function bukaModalNilai(nis, nama) {
    $('#hdnNisNilai').val(nis);
    $('#lblNamaSiswaNilai').text(nama + " (NIS: " + nis + ")");
    $('#selSemesterModal').val("1"); // Reset ke semester 1 saat dibuka

    if (globalMapel.length === 0) {
        callAPI('getMapel').then(d => { globalMapel = d; loadNilaiSiswaModal(); });
    } else {
        loadNilaiSiswaModal();
    }
    $('#mdlInputNilai').modal('show');
}

function calcModal() {
    let sumP = 0, sumK = 0, count = 0;
    $('#tbodyNilaiModal tr').each(function () {
        let elP = $(this).find('.np'); let elK = $(this).find('.nk');
        sumP += parseNilaiInput(elP.val()); sumK += parseNilaiInput(elK.val()); count++;
    });
    $('#footPModal').text(formatNilaiTampil(sumP)); $('#footKModal').text(formatNilaiTampil(sumK));
    $('#avgPModal').text(formatNilaiTampil(count > 0 ? sumP / count : 0)); $('#avgKModal').text(formatNilaiTampil(count > 0 ? sumK / count : 0));
}

function loadNilaiSiswaModal() {
    const nis = $('#hdnNisNilai').val();
    const smt = $('#selSemesterModal').val();

    $('#tbodyNilaiModal').html('<tr><td colspan="4" class="text-center py-4"><div class="spinner-border text-success"></div></td></tr>');

    callAPI('getNilaiSiswa', { nis: nis, smt: smt }).then(res => {
        // Pastikan nilais selalu array, apapun yang dikembalikan server
        const nilais = Array.isArray(res) ? res : [];
        const tb = $('#tbodyNilaiModal').empty();
        globalMapel.forEach(m => {
            const ex = nilais.find(n => String(n[1]) == String(m[0])) || [];
            const p = formatNilaiTampil(ex[2] || 0); const k = formatNilaiTampil(ex[3] || 0); const s = ex[4] || ''; const d = ex[5] || '';

            tb.append(`<tr>
                <td class="text-start fw-bold">${m[1]} <input type="hidden" class="mid" value="${m[0]}"></td>
                <td><input type="text" inputmode="decimal" class="form-control text-center np" value="${p}" oninput="validateInput(this)" onchange="calcModal()"></td>
                <td><input type="text" inputmode="decimal" class="form-control text-center nk" value="${k}" oninput="validateInput(this)" onchange="calcModal()"></td>
                <td><select class="form-control text-center ns">${pilihanSikap(s)}</select></td>
                <td><input class="form-control nd" value="${d}" placeholder="Opsional"></td>
            </tr>`);
        });
        calcModal();
    });
}

function simpanNilaiModal() {
    const nis = $('#hdnNisNilai').val();
    const smt = $('#selSemesterModal').val();
    const grades = [];
    $('#tbodyNilaiModal tr').each(function () {
        const id = $(this).find('.mid').val();
        const p = $(this).find('.np').val(); const k = $(this).find('.nk').val(); const s = $(this).find('.ns').val(); const d = $(this).find('.nd').val();
        if (id) grades.push({ id: id, p: p, k: k, s: s, d: d });
    });

    $('#loader').removeClass('hidden');
    callAPI('saveNilai', { nis: nis, semester: smt, grades: grades }).then(() => {
        $('#loader').addClass('hidden');
        showCoolAlert('Tersimpan', 'Nilai Semester ' + smt + ' berhasil disimpan!', 'success');
    });
}

function showImportNilaiPopup(nis) {
    if (!nis) return;
    Swal.fire({
        title: 'Import Nilai Siswa (Semua Semester)',
        html: `
            <div class="mb-3 text-start">
                <label class="form-label small fw-bold text-muted">Langkah 1: Unduh Format Template</label>
                <button onclick="downloadTemplate('nilai')" class="btn btn-outline-success btn-sm w-100 mb-3 fw-bold">
                    <i class="bi bi-file-earmark-excel me-1"></i> Unduh Template Excel (.xlsx)
                </button>
                <label class="form-label small fw-bold text-muted">Langkah 2: Upload File Excel Nilai</label>
                <input type="file" id="swalImportNilaiFile" class="form-control form-control-sm" accept=".xlsx,.xls,.csv">
                <small class="text-muted mt-2 d-block">Isi data nilai pada file template Excel (.xlsx) yang telah diunduh, lalu pilih file tersebut di sini.</small>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: '<i class="bi bi-upload me-1"></i> Mulai Import',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#36b9cc',
        preConfirm: () => {
            const fileInput = document.getElementById('swalImportNilaiFile');
            if (!fileInput.files || fileInput.files.length === 0) {
                Swal.showValidationMessage('Pilih file Excel terlebih dahulu!');
                return false;
            }
            return fileInput.files[0];
        }
    }).then((result) => {
        if (result.isConfirmed) {
            importNilaiPopupHandler(nis, result.value);
        }
    });
}

function importNilaiPopupHandler(nis, file) {
    if (!file) return;
    $('#loader').removeClass('hidden');
    let reader = new FileReader();
    reader.onload = function (e) {
        let csvData = e.target.result;
        if (file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls')) {
            const workbook = XLSX.read(new Uint8Array(e.target.result), { type: 'array' });
            csvData = XLSX.utils.sheet_to_csv(workbook.Sheets[workbook.SheetNames[0]]);
        }
        callAPI('importNilaiSiswa', { nis: nis, csvData: csvData }).then(res => {
            $('#loader').addClass('hidden');
            if (res.status == 'success') {
                showCoolAlert('Berhasil', res.message, 'success');
                loadNilaiSiswaModal();
            } else {
                showCoolAlert('Gagal', res.message, 'error');
            }
        });
    };
    if (file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls')) reader.readAsArrayBuffer(file);
    else reader.readAsText(file);
}
