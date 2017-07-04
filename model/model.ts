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

export class ProgressStatus {
    constructor(
        public visible: boolean,
        public active: boolean,
        public type: string,
        public value: number
    ){}

    static initialWithoutProgress: ProgressStatus = new ProgressStatus(true, true, "info", 100);
    static doneSuccessful: ProgressStatus = new ProgressStatus(true, false, "success", 100);
    static doneWithFailure: ProgressStatus = new ProgressStatus(true, false, "danger", 100);
    static hidden: ProgressStatus = new ProgressStatus(false, false, "info", 100);
}