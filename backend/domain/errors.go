package domain

import "errors"

var (
	ErrNotFound     = errors.New("data tidak ditemukan")
	ErrValidation   = errors.New("validasi gagal")
	ErrUnauthorized = errors.New("tidak terautentikasi")
	ErrForbidden    = errors.New("akses ditolak")
	ErrConflict     = errors.New("konflik data")
	ErrInternal     = errors.New("kesalahan internal")
)

type ErrorKind int

const (
	KindValidation ErrorKind = iota
	KindNotFound
	KindUnauthorized
	KindForbidden
	KindConflict
	KindInternal
)

type AppError struct {
	Kind    ErrorKind
	Message string
	Err     error
}

func (e *AppError) Error() string {
	if e.Message != "" {
		return e.Message
	}
	if e.Err != nil {
		return e.Err.Error()
	}
	return "kesalahan tidak diketahui"
}

func (e *AppError) Unwrap() error {
	return e.Err
}

func NewAppError(kind ErrorKind, message string, err error) *AppError {
	return &AppError{Kind: kind, Message: message, Err: err}
}

func NewNotFound(message string) *AppError {
	return NewAppError(KindNotFound, message, ErrNotFound)
}

func NewValidation(message string) *AppError {
	return NewAppError(KindValidation, message, ErrValidation)
}

func NewUnauthorized(message string) *AppError {
	return NewAppError(KindUnauthorized, message, ErrUnauthorized)
}

func NewInternal(message string, err error) *AppError {
	return NewAppError(KindInternal, message, err)
}
