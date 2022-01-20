const mockAxios = jest.genMockFromModule('axios')
/**@ts-ignore */
mockAxios.create = jest.fn(() => mockAxios)

export default mockAxios