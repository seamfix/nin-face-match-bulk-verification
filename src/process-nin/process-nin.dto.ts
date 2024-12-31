export interface IBody {
  bulkFk: string;
}

export interface IBulkVerificationUpdate {
  status: string;
  completion_date: string;
  expiry_date: string;
  modified_date: string;
}

export interface IBulkVerificationDetails {
  status: string;
  completion_date: string;
  expiry_date: string;
  file_name: string;
  wrapperFk: string;
  pk: string;
}

export interface IProcessBulk {
  bulkId: number;
  mode: string;
}

export interface IRequestBody {
  id: string;
  invocationId: string;
  sftpFileName?: string;
  sftpFolderName?: string;
}
