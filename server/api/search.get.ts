export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const q = query.q as string

  console.log('SEARCH QUERY:', q)

  // ถ้าไม่มี query ให้ดึงเพลงดัง
  if (!q) {
    const popularRes = await $fetch(
      `https://itunes.apple.com/search`,
      {
        params: {
          term: 'bodyslam',
          media: 'music',
          limit: 20
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
        limit: 20
      }
    }
  )

  return res
})
