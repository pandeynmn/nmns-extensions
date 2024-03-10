import { SearchRequest } from '@paperback/types'

export class Helper {
    async createChapterRequestObject($: any, page: number, source: any): Promise<any> {
        const csrf = $('meta[name=csrf-token]').attr('content')
        const requestInfo = $('div.pb-4 div').attr('wire:initial-data')
        if (requestInfo === undefined || csrf === undefined) return {}

        const jsonObj = JSON.parse(requestInfo)
        const serverMemo = jsonObj.serverMemo ?? ''
        const fingerprint = jsonObj.fingerprint ?? ''
        const updates = JSON.parse(
            `[{"type":"callMethod","payload":{"id":"${(Math.random() + 1)
                .toString(36)
                .substring(8)}","method":"gotoPage","params":[${page.toString()},"page"]}}]`
        )

        const body = {
            fingerprint: fingerprint,
            serverMemo: serverMemo,
            updates: updates,
        }

        const request = App.createRequest({
            url: `${source.baseUrl}/livewire/message/${fingerprint.name ?? 'fingerprint.was_none'}`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Livewire': 'true',
                'X-CSRF-TOKEN': csrf,
            },
            data: JSON.stringify(body),
        })

        const response = await source.requestManager.schedule(request, source.RETRY)
        source.checkResponseError(response)
        const json = JSON.parse(response.data)

        if (!json?.effects?.html) {
            throw new Error('\n(ReaperScans) -> Chapter request returned no data. Contact support.\n')
        }

        return json
    }
    async createSearchRequestObject($: any, query: SearchRequest, source: any): Promise<any> {
        const csrf = $('meta[name=csrf-token]').attr('content')
        const requestInfo = $('[wire\\:initial-data]').attr('wire:initial-data')
        if (requestInfo === undefined || csrf === undefined) return
        
        const jsonObj = JSON.parse(requestInfo)
        const serverMemo = jsonObj.serverMemo ?? ''
        const fingerprint = jsonObj.fingerprint ?? ''
        const updates = JSON.parse(
            `[{"type":"syncInput","payload":{"id":"${(Math.random() + 1)
                .toString(36)
                .substring(8)}","name":"query","value":"${query.title?.toLowerCase()}"}}]`
        )

        const body = {
            fingerprint: fingerprint,
            serverMemo: serverMemo,
            updates: updates,
        }

        const request = App.createRequest({
            url: `${source.baseUrl}/livewire/message/${fingerprint.name ?? 'fingerprint.was_none'}`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Livewire': 'true',
                'X-CSRF-TOKEN': csrf,
            },
            data: JSON.stringify(body),
        })

        const response = await source.requestManager.schedule(request, source.RETRY)
        source.checkResponseError(response)
        const json = JSON.parse(response.data)

        if (!json?.effects?.html) {
            throw new Error('\n(ReaperScans) -> Search request returned no data. Contact support.\n')
        }

        return json
    }
}
