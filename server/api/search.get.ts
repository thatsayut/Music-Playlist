export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const q = query.q as string
  const page = Number(query.page || 2)
  const limit = 20
  const offset = (page - 1) * limit
  console.log('SEARCH QUERY:', q)




  // ถ้าไม่มี query ให้ดึงเพลงดัง
  if (!q) {
    const popularRes = await $fetch(
      `https://itunes.apple.com/search`,
      {
        params: {
          term: 'bodyslam',
          media: 'music',
          limit: limit,
          offset: offset
        }
      }
    )
    return popularRes
  }

  // ถ้ามี query ให้ค้นหา
  const res = await $fetch(
    `https://itunes.apple.com/search`,
    {
      params: {
        term: q,
        media: 'music',
        limit: 20,
        offset: offset
      }
    }
  )

  return res
})
