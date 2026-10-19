// ==========================================
// 1. FUNGSI CETAK BIODATA (SUPER CEPAT & BISA ATUR MARGIN)
// ==========================================
async function cetakPDF(nis) {
    const s = globalSiswa.find(x => x[0] == nis);
    if (!s) return;

    // PANGGIL POP-UP SEBELUM CETAK
    promptCetak(async (tempatCetak, tglCetak) => {
        $('#loader').removeClass('hidden');
        $('#loaderText').text('Menyiapkan Pratinjau PDF...');

        let imgInstansi = $('#headerLogoInstansi').attr('src') || $('#prevLogoInstansi').attr('src') || '';
        let imgSekolah = $('#headerLogoSekolah').attr('src') || $('#prevLogoSekolah').attr('src') || '';
        let alamatSekolah = globalConf.alamat_sekolah ? globalConf.alamat_sekolah.replace(/\n/g, '<br>') : '-';
        let namaKepsek = globalConf.nama_kepsek || '.....................................';
        let nipKepsek = globalConf.nip_kepsek ? 'NIP. ' + globalConf.nip_kepsek : 'NIP. -';

        const imgMasukProm = s[35] ? callAPI('getImage', { id: s[35] }) : Promise.resolve('');
        const imgKeluarProm = s[36] ? callAPI('getImage', { id: s[36] }) : Promise.resolve('');
        const [imgMasuk, imgKeluar] = await Promise.all([imgMasukProm, imgKeluarProm]);

        const html = `
            <div style="font-family: 'Arial', sans-serif; font-size: 11pt; color: #000; background: #fff;">
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 5px; border: none;">
                    <tr>
                        <td width="15%" align="center" style="border: none; vertical-align: middle;">
                            ${imgInstansi ? `<img src="${imgInstansi}" style="width: 75px; height: 75px; object-fit: contain;">` : ''}
                        </td>
                        <td width="70%" style="text-align: center; line-height: 1.2; border: none; vertical-align: middle;">
                            <div style="font-size:14pt; font-weight:bold; text-transform:uppercase; letter-spacing: 1px;">${globalConf.nama_instansi || ''}</div>
                            ${globalConf.opd_dinas ? `<div style="font-size:13pt; font-weight:bold; text-transform:uppercase;">${globalConf.opd_dinas}</div>` : ''}
                            <div style="font-size:17pt; font-weight:bold; text-transform:uppercase; margin: 3px 0;">${globalConf.nama_sekolah || ''}</div>
                            <div style="font-size:10pt;">${alamatSekolah}</div>
                            <div style="font-size:9pt; margin-top: 3px;">Telp: ${globalConf.telp_sekolah || '-'}  |  Email: ${globalConf.email_sekolah || '-'}  |  Web: ${globalConf.web_sekolah || '-'}</div>
                        </td>
                        <td width="15%" align="center" style="border: none; vertical-align: middle;">
                            ${imgSekolah ? `<img src="${imgSekolah}" style="width: 75px; height: 75px; object-fit: contain;">` : ''}
                        </td>
                    </tr>
                </table>
                <div style="border-bottom: 4px double #000; margin: 5px 0 20px 0;"></div>
                
                <div style="text-align:center; font-weight:bold; text-decoration:underline; font-size:14pt; margin-bottom:20px;">LEMBAR BUKU INDUK SISWA</div>
                
                <table style="width: 100%; border-collapse: collapse; line-height: 1.5;">
                    <tr><td style="width: 25%; vertical-align: top;">1. Nama Lengkap</td><td style="width: 2%;">:</td><td style="width: 73%; font-weight: bold;">${s[2]}</td></tr>
                    <tr><td style="vertical-align: top;">2. NIS / NISN</td><td>:</td><td style="font-weight: bold;">${s[0]} / ${s[1]}</td></tr>
                    <tr><td style="vertical-align: top;">3. NIK / No.KK</td><td>:</td><td style="font-weight: bold;">${s[3]} / ${s[4]}</td></tr>
                    <tr><td style="vertical-align: top;">4. TTL</td><td>:</td><td style="font-weight: bold;">${s[5]}, ${formatTglIndoJS(s[6])}</td></tr>
                    <tr><td style="vertical-align: top;">5. Jenis Kelamin</td><td>:</td><td style="font-weight: bold;">${s[7] == 'L' ? 'Laki-laki' : 'Perempuan'}</td></tr>
                    <tr><td style="vertical-align: top;">6. Agama</td><td>:</td><td style="font-weight: bold;">${s[8]}</td></tr>
                    <tr><td style="vertical-align: top;">7. Anak ke </td><td>:</td><td style="font-weight: bold;">${s[9]} dari ${s[10]} bersaudara</td></tr>
                    <tr><td style="vertical-align: top;">8. Tinggi/Berat/Goldar</td><td>:</td><td style="font-weight: bold;">${s[16]} cm / ${s[17]} Kg / ${s[18]}</td></tr>
                    <tr><td style="vertical-align: top;">9. Hobby / Penyakit</td><td>:</td><td style="font-weight: bold;">${s[39] || '-'} / ${s[19] || '-'}</td></tr>
                    <tr><td style="vertical-align: top;">10. Alamat</td><td>:</td><td style="font-weight: bold;">${s[12]}</td></tr>
                    <tr><td style="vertical-align: top;">11. No.HP / Email</td><td>:</td><td style="font-weight: bold;">${s[13]} / ${s[53] || '-'}</td></tr>
                    <tr><td style="vertical-align: top;">12. Data Ayah</td><td>:</td><td style="font-weight: bold;">${s[20] || '-'} (${s[42] || '-'})
                        <div style="font-weight: normal; margin-left: 10px; font-size: 10pt; line-height: 1.3;">
                            <table style="width: 100%; font-size: 10pt; border: none;">
                                <tr>
                                    <td style="width: 50%; border: none;">a. Tahun Lahir : <b>${s[21] || '-'}</b></td>
                                    <td style="width: 50%; border: none;">b. Pendidikan  : <b>${s[40] || '-'}</b></td>
                                </tr>
                                <tr>
                                    <td style="border: none;">c. Pekerjaan   : <b>${s[22] || '-'}</b></td>
                                    <td style="border: none;">d. Penghasilan : <b>${s[41] || '-'}</b></td>
                                </tr>
                            </table>
                        </div>
                    </td></tr> 
                    <tr><td style="vertical-align: top;">13. Data Ibu</td><td>:</td><td style="font-weight: bold;">${s[23] || '-'} (${s[45] || '-'})
                        <div style="font-weight: normal; margin-left: 10px; font-size: 10pt; line-height: 1.3;">
                            <table style="width: 100%; font-size: 10pt; border: none;">
                                <tr>
                                    <td style="width: 50%; border: none;">a. Tahun Lahir : <b>${s[24] || '-'}</b></td>
                                    <td style="width: 50%; border: none;">b. Pendidikan  : <b>${s[43] || '-'}</b></td>
                                </tr>
                                <tr>
                                    <td style="border: none;">c. Pekerjaan   : <b>${s[25] || '-'}</b></td>
                                    <td style="border: none;">d. Penghasilan : <b>${s[44] || '-'}</b></td>
                                </tr>
                            </table>
                        </div>
                    </td></tr>
                    <tr><td style="vertical-align: top;">14. Bantuan (KIP/KPS)</td><td>:</td><td style="font-weight: bold;">
                        <div style="font-weight: normal; font-size: 10pt; line-height: 1.3;">
                            - Status KIP : <b>${s[57] || 'Tidak'}</b> ${s[57] === 'Ya' ? `(No: ${s[58] || '-'} / A.n: ${s[59] || '-'})` : ''}<br>
                            - Status KPS : <b>${s[61] || 'Tidak'}</b> ${s[61] === 'Ya' ? `(No: ${s[62] || '-'})` : ''} &nbsp;&nbsp;&nbsp; - No KKS : <b>${s[60] || '-'}</b>
                        </div>
                    </td></tr>
                    <tr><td style="vertical-align: top;">15. Data Rekening Bank</td><td>:</td><td style="font-weight: bold;">
                        <div style="font-weight: normal; font-size: 10pt; line-height: 1.3;">
                            Bank <b>${s[63] || '-'}</b> - Rekening: <b>${s[64] || '-'}</b> a.n <b>${s[65] || '-'}</b>
                        </div>
                    </td></tr>
                    <tr><td style="vertical-align: top;">16. Pindahan/Lulusan</td><td>:</td><td style="font-weight: bold;">${s[26]} / ${s[27]}</td></tr>
                    <tr><td style="vertical-align: top;">17. Diterima Tgl/Kls</td><td>:</td><td style="font-weight: bold;">${s[30]} di Kelas ${s[29]}</td></tr>
                    <tr><td style="vertical-align: top;">18. Status Akhir</td><td>:</td><td style="font-weight: bold;">${s[31]}</td></tr>
                    <tr><td style="vertical-align: top;">19. Lulus/Keluar Tgl</td><td>:</td><td style="font-weight: bold;">${s[32]}</td></tr>
                    <tr><td style="vertical-align: top;">20. No. Ijazah SLTA</td><td>:</td><td style="font-weight: bold;">${s[34]} </td></tr>
                </table>
                <div style="height: 5px;"></div>
                
                <table style="width: 100%; border-collapse: collapse; margin-top: 5px;">
                    <tr>
                        <td align="center" width="25%"><div>Foto Masuk</div><br>${imgMasuk ? `<img src="${imgMasuk}" style="width: 3cm; height: 4cm; border: 1px solid #000; object-fit: cover;">` : '<div style="width: 3cm; height: 4cm; border: 1px solid #000; line-height:4cm; text-align:center;">Tidak Ada</div>'}</td>
                        <td align="center" width="25%"><div>Foto Keluar</div><br>${imgKeluar ? `<img src="${imgKeluar}" style="width: 3cm; height: 4cm; border: 1px solid #000; object-fit: cover;">` : '<div style="width: 3cm; height: 4cm; border: 1px solid #000; line-height:4cm; text-align:center;">Tidak Ada</div>'}</td>
                        <td align="center" width="50%"> 
                            <div style="float:right; text-align:center; width:90%; font-size: 11pt;">
                                ${tempatCetak}, ${tglCetak} <br>
                                Kepala Sekolah,<br><br><br><br><br>
                                <b><u>${namaKepsek}</u></b><br>
                                ${nipKepsek}
                            </div>
                        </td>
                    </tr>
                </table>
            </div>
        `;

        var opt = {
            margin: [0.8, 1.4, 1, 1.4],
            filename: 'Data_Induk-' + s[2] + '.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, scrollY: 0, windowY: 0, useCORS: true },
            jsPDF: { unit: 'cm', format: 'a4', orientation: 'portrait' }
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

function showHapusSemuaData() {
    Swal.fire({
        title: 'HAPUS SEMUA DATA?',
        text: 'PERINGATAN! Semua data Siswa Aktif, Alumni, dan Siswa Keluar akan dihapus secara permanen. Ketik "HAPUS" untuk melanjutkan:',
        input: 'text',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Ya, Hapus Semua!',
        cancelButtonText: 'Batal',
        preConfirm: (inputValue) => {
            if (inputValue !== 'HAPUS') {
                Swal.showValidationMessage('Anda harus mengetik "HAPUS" untuk melanjutkan');
                return false;
            }
            return true;
        }
    }).then((result) => {
        if (result.isConfirmed) {
            $('#loader').removeClass('hidden');
            callAPI('hapusSemuaSiswa').then(res => {
                $('#loader').addClass('hidden');
                if (res.status === 'success') {
                    globalSiswa = [];
                    if (typeof globalAlumniData !== 'undefined') window.globalAlumniData = [];
                    if (typeof invalidateUnifiedCaches === 'function') invalidateUnifiedCaches();
                    showCoolAlert('Berhasil', 'Semua data siswa berhasil dihapus.', 'success');
                    refreshPage();
                } else {
                    showCoolAlert('Gagal', res.message, 'error');
                }
            }).catch(err => {
                $('#loader').addClass('hidden');
                showCoolAlert('Error', err.message, 'error');
            });
        }
    });
}

function showImportSiswaPopup() {
    Swal.fire({
        title: 'Import Data Siswa',
        html: `
            <div class="mb-3 text-start">
                <label class="form-label small fw-bold text-muted">Mode Import:</label>
                <select id="swalImportMode" class="form-select form-select-sm mb-3" onchange="document.getElementById('importTemplateBtn').style.display = (this.value=='manual' ? 'block' : 'none');">
                    <option value="aktif">Siswa Aktif (Dapodik Excel)</option>
                    <option value="keluar">Alumni / Siswa Keluar (Dapodik Excel)</option>
                    <option value="manual">Template Excel SiBuk InSTal (.xlsx)</option>
                </select>
                
                <div id="importTemplateBtn" style="display: none;">
                    <button onclick="downloadTemplate('siswa')" class="btn btn-outline-success btn-sm w-100 mb-3 fw-bold">
                        <i class="bi bi-file-earmark-excel me-1"></i> Unduh Template Excel (.xlsx)
                    </button>
                </div>
                
                <label class="form-label small fw-bold text-muted">Pilih File Excel:</label>
                <input type="file" id="swalImportSiswaFile" class="form-control form-control-sm" accept=".xlsx, .xls, .csv, .xml">
                <div class="d-flex justify-content-between align-items-center mt-2">
                    <small class="text-muted"><i class="bi bi-info-circle me-1"></i> Mendukung format resmi Dapodik & Template Excel.</small>

                </div>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: '<i class="bi bi-upload me-1"></i> Mulai Import',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#36b9cc',
        preConfirm: () => {
            const fileInput = document.getElementById('swalImportSiswaFile');
            const mode = document.getElementById('swalImportMode').value;
            if (!fileInput.files || fileInput.files.length === 0) {
                Swal.showValidationMessage('Pilih file terlebih dahulu!');
                return false;
            }
            return { file: fileInput.files[0], mode: mode };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            importSiswa(result.value.file, result.value.mode);
        }
    });
}

function importSiswa(file, mode) {
    if (!file) return;
    $('#loader').removeClass('hidden');

    const cleanCsvCell = (val) => {
        let s = String(val === undefined || val === null ? '' : val).trim();
        if (s.includes('"') || s.includes(',') || s.includes('\n') || s.includes('\r') || s.includes(';')) {
            return '"' + s.replace(/"/g, '""') + '"';
        }
        return s;
    };

    if (mode === 'manual') {
        const fileName = (file.name || '').toLowerCase();
        const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || fileName.endsWith('.xml');

        const sendManualData = (csvData) => {
            callAPI('importSiswaBulk', { csvData: csvData }).then(res => {
                $('#loader').addClass('hidden');
                if (res.status == 'success') {
                    showCoolAlert('Berhasil', res.message, 'success');
                    refreshAfterStudentImport();
                } else {
                    showCoolAlert('Gagal', res.message, 'error');
                }
            }).catch(err => {
                $('#loader').addClass('hidden');
                showCoolAlert('Gagal', (err && err.message) || 'Gagal memproses import data siswa', 'error');
            });
        };

        if (isExcel) {
            let reader = new FileReader();
            reader.onload = function (e) {
                try {
                    let data = new Uint8Array(e.target.result);
                    let workbook = XLSX.read(data, { type: 'array' });
                    let firstSheetName = workbook.SheetNames[0];
                    let worksheet = workbook.Sheets[firstSheetName];
                    let rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });

                    if (!rows || rows.length < 2) {
                        $('#loader').addClass('hidden');
                        showCoolAlert('Gagal', 'File Excel kosong atau tidak memiliki baris data siswa!', 'error');
                        return;
                    }

                    let validRows = rows.filter(r => r && r.length > 0 && r.some(c => String(c).trim() !== ''));
                    let csvData = validRows.map(r => r.map(cleanCsvCell).join(',')).join('\r\n');
                    sendManualData(csvData);
                } catch (err) {
                    $('#loader').addClass('hidden');
                    showCoolAlert('Gagal', 'Gagal membaca file Excel: ' + err.message, 'error');
                }
            };
            reader.readAsArrayBuffer(file);
        } else {
            let reader = new FileReader();
            reader.onload = function (e) {
                sendManualData(e.target.result);
            };
            reader.readAsText(file);
        }
    } else {
        // Mode Dapodik (Aktif / Keluar / Alumni)
        let reader = new FileReader();
        reader.onload = function (e) {
            try {
                let data = new Uint8Array(e.target.result);
                // SheetJS bisa membaca .xlsx, .xls BIFF8 maupun SpreadsheetML
                let workbook = XLSX.read(data, { type: 'array' });
                let firstSheetName = workbook.SheetNames[0];
                let worksheet = workbook.Sheets[firstSheetName];
                
                // Konversi sheet ke JSON (array of arrays)
                let rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
                
                let headers = [];
                let headerRowIndex = -1;
                
                const norm = (s) => String(s || "").trim().toLowerCase().replace(/\s+/g, " ");

                // Cari baris header Dapodik (baik Siswa Aktif maupun Siswa Keluar / Alumni)
                for (let i = 0; i < 25 && i < rows.length; i++) {
                    if (rows[i] && rows[i].length > 0) {
                        let rowStr = rows[i].map(c => norm(c)).join(" ");
                        let hasNama = rowStr.includes("nama") || rowStr.includes("peserta didik");
                        let hasId = rowStr.includes("nipd") || rowStr.includes("nisn") || rowStr.includes("nik") || rowStr.includes("no induk") || rowStr.includes("nis");
                        if (hasNama && hasId) {
                            headers = rows[i];
                            headerRowIndex = i;
                            break;
                        }
                    }
                }

                if (headerRowIndex === -1) {
                    throw new Error("Gagal menemukan baris header pada file Excel Dapodik. Pastikan file memiliki kolom Nama dan NIPD/NISN/No Induk.");
                }

                const normalizedHeaders = headers.map(h => norm(h));

                // Label blok keluarga dapat bergeser karena merge cell pada export Dapodik
                let familySubheaders = rows[headerRowIndex + 1] || [];
                let familyStarts = [];
                for (let c = 0; c < familySubheaders.length; c++) {
                    let sub = norm(familySubheaders[c]);
                    if (sub === "nama" || sub === "nama lengkap") {
                        familyStarts.push(c);
                    }
                }

                let ayahStartIndex = familyStarts[0] !== undefined ? familyStarts[0] : normalizedHeaders.findIndex(h => h.includes("ayah") && (h.includes("nama") || h.includes("data")));
                let ibuStartIndex = familyStarts[1] !== undefined ? familyStarts[1] : normalizedHeaders.findIndex(h => h.includes("ibu") && (h.includes("nama") || h.includes("data")));
                let waliStartIndex = familyStarts[2] !== undefined ? familyStarts[2] : normalizedHeaders.findIndex(h => h.includes("wali") && (h.includes("nama") || h.includes("data")));

                // SiBuk InSTal 68 kolom standard
                let simisterbinCsv = "NIS,NISN,Nama,NIK,NoKK,TempatLahir,TglLahir,JK,Agama,AnakKe,JmlSdr,Bahasa,Alamat,NoHP,Jarak,Transport,Tinggi,Berat,Goldar,Penyakit,NamaAyah,TglLahirAyah,KerjaAyah,NamaIbu,TglLahirIbu,KerjaIbu,PindahanDari,LulusanDari,NoIjazahSLTP,KlsMasuk,TglMasuk,StatusAkhir,TglKeluar,LanjutKe,NoIjazahSMA,ID_Foto_Masuk,ID_Foto_Keluar,Password_Login,Masa_Berlaku,Hobby,Pdd Ayah,Penghasilan Ayah,Status Ayah,Pdd Ibu,Penghasilan Ibu,Status Ibu,Nama Wali,Tgl Lahir Wali,Kerja Wali,Pdd Wali,Penghasilan Wali,Status Wali,KlsSaatIni,Email,Alasan Keluar,No Registrasi Akta Lahir,Kewarganegaraan,Penerima KIP,Nomor KIP,Nama di KIP,Nomor KKS,Penerima KPS,Nomor KPS,Nama Bank,Nomor Rekening Bank,Rekening Atas Nama,Berkebutuhan Khusus,Jenis Kebutuhan Khusus\n";

                // Fungsi bantu kapitalisasi (Title Case)
                const toTitleCase = (str) => {
                    if (!str) return "";
                    return String(str).toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                };

                // Fungsi bantu untuk CSV
                const cleanCsv = (text) => {
                    if (text === undefined || text === null) return "";
                    let str = String(text).trim().replace(/"/g, '""');
                    if (str.includes(',') || str.includes('\n') || str.includes('\r') || str.includes(';')) {
                        return `"${str}"`;
                    }
                    return str;
                };

                // Fungsi cerdas untuk parsing tanggal
                const smartDate = (d) => {
                    if (!d) return "";
                    if (typeof d === 'number' && d > 20000 && d < 60000) {
                        let dateObj = new Date(Math.round((d - 25569) * 86400 * 1000));
                        let y = dateObj.getFullYear();
                        let m = String(dateObj.getMonth() + 1).padStart(2, '0');
                        let day = String(dateObj.getDate()).padStart(2, '0');
                        return `${y}-${m}-${day}`;
                    }
                    let s = String(d).trim();
                    if (s.match(/^\d{4}$/)) return s + "-01-01"; // Hanya tahun
                    let dmy = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
                    if (dmy) {
                        return `${dmy[3]}-${dmy[2].padStart(2, '0')}-${dmy[1].padStart(2, '0')}`;
                    }
                    return s;
                };

                // Fungsi cerdas untuk pendidikan
                const smartPdd = (p) => {
                    if (!p) return "";
                    let s = String(p).trim().toLowerCase();
                    if (s.includes("meninggal")) return "Sudah meninggal";
                    if (s.includes("putus")) return "Putus SD";
                    if (s.includes("tidak sekolah")) return "Tidak sekolah";
                    if (s.includes("sd")) return "SD / sederajat";
                    if (s.includes("smp") || s.includes("sltp")) return "SMP / sederajat";
                    if (s.includes("sma") || s.includes("smk") || s.includes("slta")) return "SMA / sederajat";
                    if (s.includes("d4")) return "D4";
                    if (s.includes("s1")) return "S1";
                    if (s.includes("s2")) return "S2";
                    if (s.includes("s3")) return "S3";
                    if (s.includes("d1")) return "D1";
                    if (s.includes("d2")) return "D2";
                    if (s.includes("d3")) return "D3";
                    return String(p).trim();
                };

                const normalizeIncome = (value) => {
                    let text = String(value || "").toLowerCase().replace(/[–—]/g, "-");
                    if (!text) return "";
                    if (text.includes("tidak berpenghasilan")) return "Tidak Berpenghasilan";
                    let amounts = [...text.matchAll(/(?:rp\s*)?([0-9]+(?:[.,][0-9]{3})*)/g)]
                        .map(match => Number(match[1].replace(/[.,]/g, ""))).filter(Number.isFinite);
                    let lower = amounts[0] || 0;
                    if (text.includes("<") || text.includes("kurang dari")) {
                        if (lower <= 500000) return "0-500rb";
                        if (lower <= 1000000) return "500-1jt";
                        if (lower <= 2000000) return "1-2jt";
                        if (lower <= 5000000) return "2-5jt";
                        if (lower <= 10000000) return "5-10jt";
                        return ">10jt";
                    }
                    if (lower < 500000) return "0-500rb";
                    if (lower < 1000000) return "500-1jt";
                    if (lower < 2000000) return "1-2jt";
                    if (lower < 5000000) return "2-5jt";
                    if (lower < 10000000) return "5-10jt";
                    return ">10jt";
                };

                let importedCount = 0;

                // Proses data mulai dari baris setelah header
                for (let i = headerRowIndex + 1; i < rows.length; i++) {
                    let row = rows[i];
                    if (!row || row.length < 3) continue; // Skip baris kosong

                    // getVal cerdas dengan dukungan multi-search dan proteksi substring collision
                    let getVal = (...searches) => {
                        for (let search of searches) {
                            let sNorm = norm(search);
                            if (!sNorm) continue;
                            // 1. Exact match
                            for (let h = 0; h < normalizedHeaders.length; h++) {
                                if (normalizedHeaders[h] === sNorm) {
                                    let val = row[h];
                                    if (val !== undefined && val !== null && String(val).trim() !== "") {
                                        return String(val).trim();
                                    }
                                }
                            }
                        }
                        // 2. Includes match dengan proteksi
                        for (let search of searches) {
                            let sNorm = norm(search);
                            if (!sNorm) continue;
                            for (let h = 0; h < normalizedHeaders.length; h++) {
                                let hdr = normalizedHeaders[h];
                                if (!hdr) continue;
                                if (sNorm === "nis" && (hdr === "nisn" || hdr.includes("jenis") || hdr.includes("teknis"))) continue;
                                if (sNorm === "nik" && hdr.includes("teknik")) continue;
                                if (sNorm === "hp" && (hdr.includes("tahap") || hdr.includes("penghasilan"))) continue;
                                if (sNorm === "nama" && (hdr.includes("ayah") || hdr.includes("ibu") || hdr.includes("wali") || hdr.includes("sekolah") || hdr.includes("bank") || hdr.includes("kip"))) continue;
                                if (hdr.includes(sNorm)) {
                                    let val = row[h];
                                    if (val !== undefined && val !== null && String(val).trim() !== "") {
                                        return String(val).trim();
                                    }
                                }
                            }
                        }
                        return "";
                    };

                    let nipd = getVal("NIPD", "No Induk", "No. Induk", "Nomor Induk", "NIS");
                    let nama = getVal("Nama Peserta Didik", "Nama Siswa", "Nama");
                    let nisn = getVal("NISN");

                    // Bila pada export Alumni NIPD kosong tetapi NISN ada, gunakan NISN sebagai NIPD
                    if (!nipd && nisn) nipd = nisn;
                    if (!nisn && nipd) nisn = String(nipd).padStart(10, '0');

                    if (!nipd || !nama) continue; // Syarat mutlak data siswa valid

                    nama = nama.toUpperCase();

                    let jk = getVal("Jenis Kelamin", "JK", "L/P") || "-";
                    let tempatLahir = toTitleCase(getVal("Tempat Lahir Siswa", "Tempat Lahir") || "-");
                    let tglLahir = smartDate(getVal("Tanggal Lahir Siswa", "Tanggal Lahir", "Tgl Lahir") || "-");
                    let nik = getVal("NIK Siswa", "NIK") || "-";
                    let agama = getVal("Agama") || "-";
                    let noHp = getVal("Nomor Telepon Seluler", "No HP", "No. HP", "HP", "Telepon") || "-";
                    
                    let noKK = getVal("Nomor KK", "No KK", "No. KK", "Kartu Keluarga") || "-";
                    let anakKe = getVal("Anak ke", "Anak ke-", "Anak Ke");
                    let jmlSdr = getVal("Jml. Saudara", "Jumlah Saudara", "Jml Saudara", "Saudara Kandung");
                    let jarak = getVal("Jarak Rumah", "Jarak Tempat Tinggal", "Jarak ke Sekolah", "Jarak");
                    let tinggi = getVal("Tinggi Badan", "Tinggi");
                    let berat = getVal("Berat Badan", "Berat");
                    let goldar = getVal("Golongan Darah", "Gol. Darah", "Goldar");
                    let penyakit = getVal("Riwayat Penyakit", "Penyakit");
                    
                    let rt = getVal("RT");
                    let rw = getVal("RW");
                    let dusun = getVal("Dusun");
                    let kelurahan = getVal("Kelurahan", "Desa/Kelurahan", "Keluarahan", "Desa");
                    let kec = getVal("Kecamatan");
                    
                    let alamatBagian = [getVal("Alamat Lengkap", "Alamat Tinggal", "Alamat")];
                    if (rt) alamatBagian.push(`RT ${rt}`);
                    if (rw) alamatBagian.push(`RW ${rw}`);
                    if (dusun && dusun !== "-") alamatBagian.push(`Dusun ${dusun}`);
                    if (kelurahan && kelurahan !== "-") alamatBagian.push(`Desa/Kel. ${kelurahan}`);
                    if (kec && kec !== "-") alamatBagian.push(`Kec. ${kec}`);
                    let kodePos = getVal("Kode Pos");
                    if (kodePos && kodePos !== "-") alamatBagian.push(`Kode Pos ${kodePos}`);
                    let alamatLengkap = alamatBagian.filter(Boolean).join(", ");

                    // Data Ayah
                    let namaAyah = ayahStartIndex !== -1 ? (row[ayahStartIndex] || getVal("Nama Ayah", "Nama Lengkap Ayah", "Data Ayah") || "") : (getVal("Nama Ayah", "Nama Lengkap Ayah", "Data Ayah") || "");
                    let tglLahirAyah = ayahStartIndex !== -1 ? smartDate(row[ayahStartIndex + 1] || getVal("Tahun Lahir Ayah", "Tgl Lahir Ayah", "Tanggal Lahir Ayah") || "") : smartDate(getVal("Tahun Lahir Ayah", "Tgl Lahir Ayah", "Tanggal Lahir Ayah") || "");
                    let pddAyahRaw = ayahStartIndex !== -1 ? (row[ayahStartIndex + 2] || getVal("Jenjang Pendidikan Ayah", "Pendidikan Ayah", "Pdd Ayah") || "") : (getVal("Jenjang Pendidikan Ayah", "Pendidikan Ayah", "Pdd Ayah") || "");
                    let kerjaAyahRaw = ayahStartIndex !== -1 ? (row[ayahStartIndex + 3] || getVal("Pekerjaan Ayah") || "") : (getVal("Pekerjaan Ayah") || "");
                    let hasilAyah = normalizeIncome(ayahStartIndex !== -1 ? (row[ayahStartIndex + 4] || getVal("Penghasilan Ayah", "Penghasilan Bulanan Ayah")) : getVal("Penghasilan Ayah", "Penghasilan Bulanan Ayah"));
                    
                    let pddAyah = smartPdd(pddAyahRaw);
                    let statusAyah = "Masih hidup";
                    let kerjaAyah = kerjaAyahRaw;

                    if (pddAyah === "Sudah meninggal" || String(kerjaAyahRaw).toLowerCase().includes("meninggal")) {
                        statusAyah = "Sudah meninggal";
                        pddAyah = "";
                        kerjaAyah = "";
                    }

                    // Data Ibu
                    let namaIbu = ibuStartIndex !== -1 ? (row[ibuStartIndex] || getVal("Nama Ibu", "Nama Lengkap Ibu", "Data Ibu") || "") : (getVal("Nama Ibu", "Nama Lengkap Ibu", "Data Ibu") || "");
                    let tglLahirIbu = ibuStartIndex !== -1 ? smartDate(row[ibuStartIndex + 1] || getVal("Tahun Lahir Ibu", "Tgl Lahir Ibu", "Tanggal Lahir Ibu") || "") : smartDate(getVal("Tahun Lahir Ibu", "Tgl Lahir Ibu", "Tanggal Lahir Ibu") || "");
                    let pddIbuRaw = ibuStartIndex !== -1 ? (row[ibuStartIndex + 2] || getVal("Jenjang Pendidikan Ibu", "Pendidikan Ibu", "Pdd Ibu") || "") : (getVal("Jenjang Pendidikan Ibu", "Pendidikan Ibu", "Pdd Ibu") || "");
                    let kerjaIbuRaw = ibuStartIndex !== -1 ? (row[ibuStartIndex + 3] || getVal("Pekerjaan Ibu") || "") : (getVal("Pekerjaan Ibu") || "");
                    let hasilIbu = normalizeIncome(ibuStartIndex !== -1 ? (row[ibuStartIndex + 4] || getVal("Penghasilan Ibu", "Penghasilan Bulanan Ibu")) : getVal("Penghasilan Ibu", "Penghasilan Bulanan Ibu"));
                    
                    let pddIbu = smartPdd(pddIbuRaw);
                    let statusIbu = "Masih hidup";
                    let kerjaIbu = kerjaIbuRaw;

                    if (pddIbu === "Sudah meninggal" || String(kerjaIbuRaw).toLowerCase().includes("meninggal")) {
                        statusIbu = "Sudah meninggal";
                        pddIbu = "";
                        kerjaIbu = "";
                    }

                    // Data Wali
                    let namaWali = toTitleCase(waliStartIndex !== -1 ? (row[waliStartIndex] || getVal("Nama Wali", "Nama Lengkap Wali", "Data Wali") || "") : (getVal("Nama Wali", "Nama Lengkap Wali", "Data Wali") || ""));
                    let tglLahirWali = waliStartIndex !== -1 ? smartDate(row[waliStartIndex + 1] || getVal("Tahun Lahir Wali", "Tgl Lahir Wali", "Tanggal Lahir Wali") || "") : smartDate(getVal("Tahun Lahir Wali", "Tgl Lahir Wali", "Tanggal Lahir Wali") || "");
                    let pddWaliRaw = waliStartIndex !== -1 ? (row[waliStartIndex + 2] || getVal("Jenjang Pendidikan Wali", "Pendidikan Wali", "Pdd Wali") || "") : (getVal("Jenjang Pendidikan Wali", "Pendidikan Wali", "Pdd Wali") || "");
                    let kerjaWaliRaw = waliStartIndex !== -1 ? (row[waliStartIndex + 3] || getVal("Pekerjaan Wali") || "") : (getVal("Pekerjaan Wali") || "");
                    let hasilWali = normalizeIncome(waliStartIndex !== -1 ? (row[waliStartIndex + 4] || getVal("Penghasilan Wali", "Penghasilan Bulanan Wali")) : getVal("Penghasilan Wali", "Penghasilan Bulanan Wali"));
                    
                    let pddWali = smartPdd(pddWaliRaw);
                    let statusWali = "Masih hidup";
                    let kerjaWali = kerjaWaliRaw;

                    if (pddWali === "Sudah meninggal" || String(kerjaWaliRaw).toLowerCase().includes("meninggal")) {
                        statusWali = "Sudah meninggal";
                        pddWali = "";
                        kerjaWali = "";
                    }

                    // Sekolah Asal dan Ijazah
                    let asalSekolah = getVal("Sekolah Asal", "Asal Sekolah", "Lulusan Dari", "Nama Sekolah Asal");
                    let noIjazahSltp = getVal("No Seri Ijazah", "No Ijazah SLTP", "No Ijazah SMP", "Nomor Seri Ijazah SMP/MTs");

                    let email = getVal("Email", "E-mail", "E-Mail", "Surel") || "";
                    let noRegAkta = getVal("No Registrasi Akta Lahir", "Nomor Registrasi Akta Lahir", "No Registrasi Akta", "No Akta Lahir");
                    let kewarganegaraan = getVal("Kewarganegaraan") || "WNI";
                    let penerimaKip = getVal("Penerima KIP", "KIP (Apakah Menerima)") || "Tidak";
                    let noKip = getVal("Nomor KIP", "No. KIP", "No KIP");
                    let namaKip = getVal("Nama di KIP", "Nama Tertera di KIP");
                    let noKks = getVal("Nomor KKS", "No. KKS", "No KKS");
                    let penerimaKps = getVal("Penerima KPS", "Penerima KPS/PKH") || "Tidak";
                    let noKps = getVal("No. KPS", "Nomor KPS", "No KPS");
                    let namaBank = getVal("Bank", "Nama Bank");
                    let noRekeningBank = getVal("Nomor Rekening Bank", "No Rekening Bank", "No. Rekening");
                    let rekeningAtasNama = getVal("Rekening Atas Nama", "Nama Rekening");
                    let kebutuhanKhusus = getVal("Berkebutuhan Khusus", "Kebutuhan Khusus");
                    let transportRaw = getVal("Alat Transportasi", "Transportasi", "Transport") || "";
                    let transport = transportRaw;
                    let tr = transportRaw.toLowerCase();
                    if (tr.includes("jalan")) transport = "Jalan kaki";
                    else if (tr.includes("motor")) transport = "Sepeda Motor";
                    else if (tr.includes("mobil") || tr.includes("antar") || tr.includes("jemput") || tr.includes("bus")) transport = "Mobil/bus antar jemput";
                    else if (tr.includes("sepeda")) transport = "Sepeda";

                    let rombelSaatIni = getVal("Rombel Saat Ini", "Rombel", "Rombongan Belajar", "Kelas");
                    let _alasanKeluar = getVal("Alasan Keluar", "Keluar Karena", "Sebab Keluar", "Keterangan Keluar") || "";
                    let _statusAkhir = getVal("Status Akhir", "Status Siswa", "Status") || "";

                    if (!_statusAkhir) {
                        if (mode === 'keluar') {
                            let al = _alasanKeluar.toLowerCase();
                            if (al.includes('lulus')) {
                                _statusAkhir = 'Lulus';
                            } else if (al.includes('mutasi') || al.includes('pindah')) {
                                _statusAkhir = 'Mutasi Keluar';
                            } else if (al.includes('drop') || al.includes('do') || al.includes('keluar')) {
                                _statusAkhir = 'Keluar';
                            } else if (al.includes('meninggal')) {
                                _statusAkhir = 'Meninggal';
                            } else {
                                _statusAkhir = 'Lulus';
                            }
                        } else {
                            _statusAkhir = 'Aktif';
                        }
                    }

                    let _tglKeluar = smartDate(getVal("Tanggal Keluar", "Tgl Keluar", "Tanggal Keluar / Lulus", "Tanggal Lulus", "Tgl Lulus") || "");

                    let out = Array(68).fill("");
                    out[0] = nipd;
                    out[1] = nisn;
                    out[2] = nama;
                    out[3] = nik;
                    out[4] = noKK;
                    out[5] = tempatLahir;
                    out[6] = tglLahir;
                    out[7] = jk;
                    out[8] = agama;
                    
                    out[9] = anakKe;
                    out[10] = jmlSdr;
                    out[11] = getVal("Bahasa", "Bahasa Sehari-hari") || "";
                    
                    out[12] = alamatLengkap;
                    
                    out[13] = noHp;
                    out[14] = jarak;
                    out[15] = transport;
                    out[16] = tinggi;
                    out[17] = berat;
                    out[18] = goldar;
                    out[19] = penyakit;
                    out[20] = toTitleCase(namaAyah);
                    out[21] = tglLahirAyah;
                    out[22] = kerjaAyah;
                    out[23] = toTitleCase(namaIbu);
                    out[24] = tglLahirIbu;
                    out[25] = kerjaIbu;
                    out[26] = getVal("Pindahan Dari", "Sekolah Asal Pindahan") || "";
                    out[27] = asalSekolah;
                    out[28] = noIjazahSltp;
                    out[29] = getVal("Kelas Masuk", "Kls Masuk") || (mode === 'aktif' ? rombelSaatIni : "");
                    out[30] = smartDate(getVal("Tanggal Masuk", "Tgl Masuk") || "");
                    out[31] = _statusAkhir;
                    out[32] = _tglKeluar;
                    
                    out[33] = getVal("Lanjut Ke", "Melanjutkan Ke") || "";
                    out[34] = getVal("No Ijazah SMA", "No Ijazah SMK", "Nomor Ijazah") || "";
                    
                    // Default password siswa login
                    out[37] = "123456";

                    // Kolom Google Sheet Index 39-54
                    out[39] = getVal("Hobby", "Hobi") || "";
                    out[40] = pddAyah;
                    out[41] = hasilAyah;
                    out[42] = statusAyah;
                    out[43] = pddIbu;
                    out[44] = hasilIbu;
                    out[45] = statusIbu;
                    out[46] = namaWali;
                    out[47] = tglLahirWali;
                    out[48] = kerjaWali;
                    out[49] = pddWali;
                    out[50] = hasilWali;
                    out[51] = statusWali;
                    out[52] = rombelSaatIni;
                    out[53] = email;
                    out[54] = _alasanKeluar || (mode === 'keluar' ? _statusAkhir : "");
                    out[55] = noRegAkta;
                    out[56] = kewarganegaraan;
                    out[57] = /^(ya|yes)$/i.test(penerimaKip) ? "Ya" : "Tidak";
                    out[58] = noKip;
                    out[59] = namaKip;
                    out[60] = noKks;
                    out[61] = /^(ya|yes)$/i.test(penerimaKps) ? "Ya" : "Tidak";
                    out[62] = noKps;
                    out[63] = namaBank;
                    out[64] = noRekeningBank;
                    out[65] = rekeningAtasNama;
                    out[66] = kebutuhanKhusus && kebutuhanKhusus !== "Tidak ada" && kebutuhanKhusus !== "-" ? "Ya" : "Tidak";
                    out[67] = out[66] === "Ya" ? kebutuhanKhusus : "";

                    simisterbinCsv += out.map(cleanCsv).join(",") + "\n";
                    importedCount++;
                }

                if (importedCount === 0) {
                    throw new Error("Tidak ada data siswa yang valid (memiliki NIPD/NISN dan Nama) di dalam file Dapodik.");
                }

                // Kirim CSV ke API
                callAPI('importSiswaBulk', { csvData: simisterbinCsv }).then(res => {
                    $('#loader').addClass('hidden');
                    if (res.status == 'success') {
                        showCoolAlert('Berhasil', res.message, 'success');
                        refreshAfterStudentImport();
                    } else {
                        showCoolAlert('Gagal', res.message, 'error');
                    }
                });

            } catch (err) {
                $('#loader').addClass('hidden');
                console.error(err);
                showCoolAlert('Gagal Membaca File', 'Terjadi kesalahan saat membaca file Excel Dapodik: ' + err.message, 'error');
            }
        };
        reader.readAsArrayBuffer(file);
    }
}

async function refreshAfterStudentImport() {
    if (typeof invalidateUnifiedCaches === 'function') invalidateUnifiedCaches();
    globalSiswa = [];
    await loadSiswa();
    if (curPage === 'data-siswa' && typeof loadUnifiedSiswa === 'function') {
        await loadUnifiedSiswa();
        renderUnifiedDataMenu();
    } else if (curPage === 'leger-siswa' && typeof loadUnifiedSiswa === 'function') {
        await loadUnifiedSiswa();
        renderUnifiedLegerMenu();
    } else if (curPage === 'klaper-siswa' && typeof loadUnifiedSiswa === 'function') {
        await loadUnifiedSiswa();
        renderKlaperTable();
    }
}

// --- FUNGSI KARTU & PASSWORD ---
function resetPassAdmin(nis) {
    Swal.fire({ title: 'Reset Password', input: 'text', inputLabel: 'Masukkan Password Baru', inputPlaceholder: 'Contoh: 123456', showCancelButton: true }).then((res) => {
        if (res.isConfirmed && res.value) {
            $('#loader').removeClass('hidden');
            callAPI('resetPasswordSiswa', { nis: nis, newPass: res.value }).then(r => { $('#loader').addClass('hidden'); if (r.status === 'success') Swal.fire('Sukses', 'Password direset!', 'success'); else Swal.fire('Gagal', r.message, 'error'); });
        }
    });
}

function simpanPasswordSiswa() {
    $('#loader').removeClass('hidden');
    callAPI('changeOwnPassword', { nis: window.siswaAktif.nis, oldPass: $('#oldPass').val(), newPass: $('#newPass').val() }).then(r => {
        $('#loader').addClass('hidden');
        if (r.status === 'success') { $('#mdlGantiPass').modal('hide'); Swal.fire('Sukses', 'Password diubah', 'success'); }
        else Swal.fire('Gagal', r.message, 'error');
    });
}

// === MENAMPILKAN KARTU KE POP-UP ===baru
function tampilkanKartuKeModal(nama, nisn, ttl, jk, fotoId, status) {
    // 1. LOADING DULU (Jangan ada perintah show modal di sini)
    $('#loader').removeClass('hidden');
    $('#loaderText').text('Memproses Desain Kartu...');

    let isAlumni = (status === 'Lulus');
    $('#judulKartuModal').text(isAlumni ? 'KARTU ALUMNI' : 'KARTU PELAJAR');

    // 2. Isi Teks
    $('#card-instansi').text(globalConf.nama_instansi);
    $('#card-sekolah').text(globalConf.nama_sekolah);
    $('#card-alamat-sek').text(globalConf.alamat_sekolah);
    $('#card-kontak-sek').html(`Email: ${globalConf.email_sekolah||'-'} | Web: ${globalConf.web_sekolah||'-'} | Telp: ${globalConf.telp_sekolah||'-'}`);
    
    let nmSekolah = (globalConf.nama_sekolah || 'sekolah ini').toUpperCase();
    $('#judulKartuModalBack').text(isAlumni ? 'KARTU IDENTITAS ALUMNI' : 'KARTU IDENTITAS PELAJAR');
    $('#aturan-1').text(isAlumni ? `Kartu ini adalah tanda pengenal sah alumni ${nmSekolah}.` : `Kartu ini adalah tanda pengenal sah siswa/siswi ${nmSekolah}.`);
    $('#aturan-5').text(isAlumni ? 'Berlaku selama yang bersangkutan berstatus alumni sekolah ini.' : 'Berlaku selama yang bersangkutan berstatus aktif di sekolah ini.');
    
    $('#card-nama').text(nama);
    $('#card-nisn').text(nisn);

    let tmpt = ttl.split(',')[0] || '-';
    let tgl = ttl.split(',')[1] || '-';
    $('#card-tmp').text(tmpt.trim());
    $('#card-tgl').text(tgl.trim());
    $('#card-jk').text(jk);
    $('#card-link-validasi').text(globalConf.link_validasi || "https://simisterbin.my.id");

    // 3. QR Code pakai API luar agar terbaca sebagai gambar (Aman untuk didownload)
    $('#qrcode').html(`<img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&margin=0&data=${nisn}" crossorigin="anonymous" style="width:85px; height:85px; display:block;">`);
    
    const dateNow = new Date();
    const mm = String(dateNow.getMonth() + 1).padStart(2, '0');
    const yyyy = dateNow.getFullYear();
    const qrBackData = `Kartu ini merupakan dokumen ${globalConf.nama_sekolah} yang sah dan ditandatangani secara elektronik oleh kepala sekolah : ${globalConf.nama_kepsek||'-'} - ${globalConf.nip_kepsek||'-'}. date : ${mm}/${yyyy}`;
    $('#qr-back-img').attr('src', `https://api.qrserver.com/v1/create-qr-code/?size=100x100&margin=0&data=${encodeURIComponent(qrBackData)}`);

    // Kosongkan gambar lama
    $('#card-foto').attr('src', '');
    $('#card-bg-back').attr('src', '');

    // 4. Tarik Base64 dari Server
    callAPI('getSemuaGambarKartu', {
        fotoId: fotoId,
        bgDepan: globalConf.background_kartu,
        bgBelakang: globalConf.background_belakang,
        logoInstansi: globalConf.logo_instansi,
        logoSekolah: globalConf.logo_sekolah
    }).then(res => {

        // 5. Tempelkan ke HTML
        if (res.foto) $('#card-foto').attr('src', res.foto);
        else $('#card-foto').attr('src', 'https://via.placeholder.com/75x100?text=Kosong');

        if (res.logo1) {
            $('#card-logo-instansi').attr('src', res.logo1).show();
            $('#card-logo-instansi-back').attr('src', res.logo1).show();
        } else {
            $('#card-logo-instansi').hide();
            $('#card-logo-instansi-back').hide();
        }

        if (res.logo2) {
            $('#card-logo-sekolah').attr('src', res.logo2).show();
            $('#card-logo-sekolah-back').attr('src', res.logo2).show();
        } else {
            $('#card-logo-sekolah').hide();
            $('#card-logo-sekolah-back').hide();
        }

        if (res.bg1) {
            $('#card-bg-layer').css('background-image', `url(${res.bg1})`).show();
            $('#card-bg-gradient').hide();
        } else {
            $('#card-bg-layer').hide();
            $('#card-bg-gradient').show();
        }

        if (res.bg2) {
            $('#card-bg-layer-back').css('background-image', `url(${res.bg2})`).show();
            $('#card-bg-gradient-back').hide();
        } else {
            $('#card-bg-layer-back').hide();
            $('#card-bg-gradient-back').show();
        }
        $('#card-back-wrap').show();

        window.namaKartuCetak = nama;

        // 6. SETELAH GAMBAR NEMPEL SEMUA, TUNGGU 1 DETIK, BARU BUKA MODAL FIX!
        setTimeout(() => {
            $('#loader').addClass('hidden'); // Matikan Layar Loading Hitam
            $('#mdlKartu').modal('show');    // <--- MODAL BARU BOLEH DIBUKA DI SINI
        }, 1000);
    });
}

// === UNDUH KARTU DEPAN ===
function downloadKartuDepan() {
    Swal.fire({ title: 'Menyiapkan Unduhan...', text: 'Mohon tunggu...', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); } });
    setTimeout(() => {
        html2canvas(document.getElementById('capture-area'), { scale: 3, useCORS: true }).then(c => {
            let a = document.createElement('a'); a.download = "Kartu_Depan_" + window.namaKartuCetak + ".jpg"; a.href = c.toDataURL("image/jpeg", 0.95); a.click();
            Swal.close();
        });
    }, 500);
}

// === UNDUH KARTU BELAKANG ===
function downloadKartuBelakang() {
    if (!globalConf.background_belakang || globalConf.background_belakang === '') { Swal.fire('Info', 'Background belakang belum diatur oleh admin.', 'info'); return; }
    Swal.fire({ title: 'Menyiapkan Unduhan...', text: 'Mohon tunggu...', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); } });
    setTimeout(() => {
        html2canvas(document.getElementById('capture-area-back'), { scale: 3, useCORS: true }).then(c => {
            let a = document.createElement('a'); a.download = "Kartu_Belakang_" + window.namaKartuCetak + ".jpg"; a.href = c.toDataURL("image/jpeg", 0.95); a.click();
            Swal.close();
        });
    }, 500);
}

function lihatKartu() {
    const d = window.siswaAktif;
    // Jika alumni, gunakan foto keluar. Jika tidak, foto masuk.
    let isAlumni = (d.status_akhir === 'Lulus');

    // Tegas: Alumni pakai foto_keluar, Siswa pakai foto_id (masuk)
    let fotoDipakai = isAlumni ? d.foto_keluar : d.foto_id;

    tampilkanKartuKeModal(d.nama, d.nisn, (d.tmplahir || '-') + ', ' + (d.tgllahir_indo || '-'), d.jk === 'L' ? 'Laki-laki' : 'Perempuan', fotoDipakai, d.status_akhir);
}

function cetakKartuAdmin(nis) {
    const d = globalSiswa.find(x => String(x[0]) === String(nis));
    if (!d) return;

    let isAlumni = (d[31] === 'Lulus');
    // Tegas: Index 36 = Foto Keluar, Index 35 = Foto Masuk
    let fotoDipakai = isAlumni ? d[36] : d[35];

    tampilkanKartuKeModal(d[2], d[1], d[5] + ', ' + formatTglIndoJS(d[6]), d[7] === 'L' ? 'Laki-laki' : 'Perempuan', fotoDipakai, d[31]);
}

