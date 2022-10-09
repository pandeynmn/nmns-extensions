export class Helper {

    async createChapterRequestObject($: any, page: number, source: any): Promise<any> {
        const csrf = $('meta[name=csrf-token]').attr('content')
        const requestInfo  = $('div.pb-4 div').attr('wire:initial-data')
        if (requestInfo === undefined || csrf === undefined) return {}

        const jsonObj = JSON.parse(requestInfo)
        const serverMemo  = jsonObj.serverMemo ?? ''
        const fingerprint = jsonObj.fingerprint ?? ''
        const updates     = JSON.parse(`[{"type":"callMethod","payload":{"id":"9jhcg","method":"gotoPage","params":[${page.toString()},"page"]}}]`)

        const body = {
            'fingerprint': fingerprint,
            'serverMemo': serverMemo,
            'updates': updates
        }

        const request = createRequestObject({
            url: `${source.baseUrl}/livewire/message/frontend.comic-chapters-list`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Livewire': 'true',
                'X-CSRF-TOKEN': csrf,
            },
            data: JSON.stringify(body),
        })
        const response = await source.requestManager.schedule(request, source.RETRY)
        source.CloudFlareError(response.status)
        return JSON.parse(response.data)
    }
}