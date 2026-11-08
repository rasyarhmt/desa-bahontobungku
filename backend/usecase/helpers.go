package usecase

func mapToDTOList[S, T any](items []S, toDTO func(*S) *T) []T {
	result := make([]T, 0, len(items))
	for i := range items {
		result = append(result, *toDTO(&items[i]))
	}
	return result
}
