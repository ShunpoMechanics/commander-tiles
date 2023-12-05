export interface BulkData {
    object: string,
    has_more: boolean,
    data: Data[]
}

export interface Data {
    object: string,
    id: string,
    type: string,
    updated_at: string,
    uri: string,
    name: string,
    description: string,
    size: number,
    download_uri: string,
    content_type: string,
    content_encoding: string
}
