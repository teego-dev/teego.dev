const textFields = new Set([
    "Ticker",
    "Date",
    "Name",
    "Industry",
]);

fetch("./profiles.csv")
    .then((response) => {
        if (!response.ok) {
            throw new Error("Unable to load profiles.csv");
        }
        return response.text();
    })
    .then((csvText) => {
        const result = Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            transformHeader: (header) => header.trim(),
        });
        if (result.errors && result.errors.length) {
            console.warn("CSV parse warnings:", result.errors);
        }

        const columns = result.meta.fields
            .filter((field) => field !== "Date" && field !== "Industry" && field !== "Name")
            .map((field) => ({
                title: field,
                field,
                cssClass: textFields.has(field) ? "" : "numeric-column",
                minWidth: 60,
                sorter: textFields.has(field) ? "string" : "number",
                hozAlign: textFields.has(field) ? "left" : "right",
                // formatter: (cell) => {
                //     const value = cell.getValue();
                //     return value === null || value === undefined || value === "" ? "—" : value;
                // }
            }));

        columns[0] = {
            title: "Ticker",
            field: "Ticker",
            minWidth: 180,
            sorter: "string",
            formatter: (cell) => {
                const profile = cell.getRow().getData();
                return `<div class="profile-ticker">${profile.Ticker} | ${profile.Date}</div><div class="profile-name">${profile.Name}</div></div><div class="profile-industry">${profile.Industry}</div>`;
            },
        };

        const supportsColumnRearrangement = !window.matchMedia("(pointer: coarse)").matches;

        const table = new Tabulator("#profiles-table", {
            data: result.data,
            layout: "fitColumns",
            responsiveLayout: false,
            height: "72vh",
            placeholder: "No profiles available",
            movableColumns: supportsColumnRearrangement,
            resizableColumns: supportsColumnRearrangement,
            selectableRows: false,
            headerSort: true,
            headerWordWrap: true,
            columns,
        });

        const searchInput = document.getElementById("ticker-search");
        if (searchInput) {
            searchInput.addEventListener("input", (event) => {
                const query = event.target.value.trim().toLowerCase();
                table.setFilter((rowData) => {
                    return !query || [rowData.Ticker, rowData.Name, rowData.Industry].some((value) =>
                        String(value ?? "").toLowerCase().includes(query),
                    );
                });
            });
        }
    })
    .catch((error) => {
        console.error(error);
        document.getElementById("profiles-table").innerHTML =
            "<div class='tabulator-placeholder'>Unable to load profiles_20260903.csv</div>";
    });
