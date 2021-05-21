import pbx from './pbx'

export const getContactByNumber = async ({
  search_text,
}: {
  search_text: string
}) => {
  const res = await pbx.client._pal('getContactList', {
    search_text,
    shared: 'true',
  })

  return res.map(({ aid, display_name }) => ({
    id: aid,
    name: display_name,
  }))
}
