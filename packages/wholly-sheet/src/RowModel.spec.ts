/*

 MIT License

 Copyright (c) 2020 Looker Data Sciences, Inc.

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.

 */
import { IRowModel, nilCell, noDate, RowModel, stringer } from './RowModel'

interface ITestRow extends IRowModel {
  toggle: boolean
  score: number
  $notheader: string
}

class TestRow extends RowModel<ITestRow> {
  toggle = false
  score = 0
  $notheader = ''
  constructor(values?: any) {
    super(values)
    if (values) this.assign(values)
  }
}

describe('RowModel', () => {
  describe('stringer', () => {
    test('formats dates', () => {
      expect(stringer(new Date('2019-11-05T15:00:00.000000+00:00'))).toEqual(
        '2019-11-05T15:00:00.000Z'
      )
    })
    test('NILs empty dates', () => {
      expect(stringer(noDate)).toEqual(nilCell)
    })
    test('NILs undefined', () => {
      expect(stringer(undefined)).toEqual(nilCell)
    })
    test('NILs null', () => {
      expect(stringer(null)).toEqual(nilCell)
    })
    test('Returns empty string', () => {
      expect(stringer('')).toEqual('')
    })
    test('Returns bool string', () => {
      expect(stringer(true)).toEqual('true')
      expect(stringer(false)).toEqual('false')
    })
    test('Returns float string', () => {
      expect(stringer(1.2)).toEqual('1.2')
    })
    test('Returns int string', () => {
      expect(stringer(12)).toEqual('12')
    })
  })

  test('header omits row key and $ vars', () => {
    const row = new TestRow()
    const expected = ['_id', '_updated', 'toggle', 'score']
    const actual = row.header()
    expect(actual).toEqual(expected)
  })

  test('displayHeaders omits _ and $ vars', () => {
    const row = new TestRow()
    const expected = ['toggle', 'score']
    const actual = row.displayHeader()
    expect(actual).toEqual(expected)
  })

  describe('initialization', () => {
    test('inits with default values', () => {
      const actual = new TestRow()
      expect(actual._row).toEqual(0)
      expect(actual._id).toEqual('')
      expect(actual._updated).toEqual(noDate)
      expect(actual.toggle).toEqual(false)
      expect(actual.score).toEqual(0)
    })
    test('inits with object values', () => {
      const now = new Date()
      const actual = new TestRow({
        _row: 2,
        _id: '3',
        _updated: now,
        toggle: true,
        score: 5,
      })
      expect(actual._row).toEqual(2)
      expect(actual._id).toEqual('3')
      expect(actual._updated).toEqual(now)
      expect(actual.toggle).toEqual(true)
      expect(actual.score).toEqual(5)
    })
    test('inits with value array', () => {
      const now = new Date()
      const actual = new TestRow(['3', now, true, 5])
      expect(actual._row).toEqual(0)
      expect(actual._id).toEqual('3')
      expect(actual._updated).toEqual(now)
      expect(actual.toggle).toEqual(true)
      expect(actual.score).toEqual(5)
    })
  })
  describe('assign', () => {
    test('with value array', () => {
      const now = new Date()
      const actual = new TestRow()
      actual.assign(['3', now, true, 5])
      expect(actual._row).toEqual(0)
      expect(actual._id).toEqual('3')
      expect(actual._updated).toEqual(now)
      expect(actual.toggle).toEqual(true)
      expect(actual.score).toEqual(5)
    })
    test('with object', () => {
      const now = new Date()
      const actual = new TestRow()
      actual.assign({
        _row: 2,
        _id: '3',
        _updated: now,
        toggle: true,
        score: 5,
      })
      expect(actual._row).toEqual(2)
      expect(actual._id).toEqual('3')
      expect(actual._updated).toEqual(now)
      expect(actual.toggle).toEqual(true)
    })
  })
  describe('prepare', () => {
    test('assigns empty id and updated', () => {
      const actual = new TestRow()
      expect(actual._row).toEqual(0)
      expect(actual._id).toEqual('')
      expect(actual._updated).toEqual(noDate)
      actual.prepare()
      expect(actual._row).toEqual(0)
      expect(actual._id).not.toEqual('')
      expect(actual._updated).not.toEqual(noDate)
    })
    test('updates updated without updating id', async () => {
      const id = 'baad-f00d'
      const actual = new TestRow({ row: 1, id })
      actual.prepare()
      expect(actual._row).toEqual(1)
      expect(actual._id).toEqual(id)
      expect(actual._updated).not.toEqual(noDate)
      const updated = actual._updated
      jest.useFakeTimers()
      await null // match delay from await func1()
      jest.advanceTimersByTime(1000)
      actual.prepare()
      expect(actual._row).toEqual(1)
      expect(actual._id).toEqual(id)
      expect(actual._updated.getTime()).not.toEqual(updated.getTime())
    })
  })
})
