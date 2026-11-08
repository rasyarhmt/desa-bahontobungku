package repository

import (
	"database/sql"
	"errors"
)

type rowScanner interface {
	Scan(dest ...interface{}) error
}

func scanOne[T any](row rowScanner, scan func(rowScanner) (*T, error)) (*T, error) {
	v, err := scan(row)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return v, nil
}

func scanAll[T any](rows *sql.Rows, scan func(rowScanner) (*T, error)) ([]T, error) {
	defer rows.Close()

	result := make([]T, 0)
	for rows.Next() {
		v, err := scan(rows)
		if err != nil {
			return nil, err
		}
		result = append(result, *v)
	}
	return result, rows.Err()
}

func execReturningID(result sql.Result, err error) (int, error) {
	if err != nil {
		return 0, err
	}
	id, err := result.LastInsertId()
	if err != nil {
		return 0, err
	}
	return int(id), nil
}

func execAffected(result sql.Result, err error) (bool, error) {
	if err != nil {
		return false, err
	}
	affected, err := result.RowsAffected()
	if err != nil {
		return false, err
	}
	return affected > 0, nil
}
