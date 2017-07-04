export class CommonVariable {
    constructor(
        public url: string,
        public urlbase: string,
        public isOnline: boolean,
        public apiVersion: string,
        public OrganisationUnit: string,
        public OrganisationUnitList: Orgunit[],
        public Period: string,
        public DataSet: string
    ){}
}

export class Orgunit {
    constructor(
        id: string,
        name: string
    ){}
}

export class TrackerDataExportLog {
    constructor(
        public filename: string,
        public start: string,
        public end: string
    ){}
}