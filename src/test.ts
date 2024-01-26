import { crush, construct, get } from '@bruyland/utilities'

const a = {
  name: 'name',
  db: {
    host: 'host',
    post: 123,
  },
  l1: { l2: { l3: 'test' } },
}

const b = {
  id: 'id',
  db: {
    host: 'host2',
    user: 'Stefaan',
  },
  l1: { l2: { l3b: 'l3b' } },
}

const cfg = construct({ ...crush(a), ...crush(b) })
console.log(get(cfg, 'db'))
