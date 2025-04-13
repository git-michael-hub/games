import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChessBoard from './ChessBoard';

describe('ChessBoard Component', () => {
  const mockOnCapture = jest.fn();
  const mockOnTurnChange = jest.fn();
  const mockOnStatusChange = jest.fn();
  const mockOnMoveRecord = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the chess board with pieces', () => {
    render(
      <ChessBoard
        onCapture={mockOnCapture}
        onTurnChange={mockOnTurnChange}
        onStatusChange={mockOnStatusChange}
        onMoveRecord={mockOnMoveRecord}
      />
    );

    // Check if the board container is rendered
    const boardContainer = screen.getByTestId('board-container');
    expect(boardContainer).toBeInTheDocument();

    // Check if all 32 pieces are rendered (16 for each player)
    const pieces = screen.getAllByTestId('piece-container');
    expect(pieces).toHaveLength(32);
  });

  test('allows white to move first', () => {
    render(
      <ChessBoard
        onCapture={mockOnCapture}
        onTurnChange={mockOnTurnChange}
        onStatusChange={mockOnStatusChange}
        onMoveRecord={mockOnMoveRecord}
      />
    );

    // Find the status display
    const statusText = screen.getByText(/Status: playing, Turn: white/i);
    expect(statusText).toBeInTheDocument();

    // Find a white pawn (at row 6, col 0)
    const whitePawn = screen.getByText('♙');
    expect(whitePawn).toBeInTheDocument();

    // Click on the white pawn to select it
    fireEvent.click(whitePawn);

    // Find and click on a valid move square (e.g., row 5, col 0)
    const moveSquare = screen.getByTestId('valid-move');
    expect(moveSquare).toBeInTheDocument();
    fireEvent.click(moveSquare);

    // Verify turn change was called and the turn switched to black
    expect(mockOnTurnChange).toHaveBeenCalledWith('black');
    expect(mockOnMoveRecord).toHaveBeenCalled();
  });

  test('prevents moving opponent pieces when not your turn', () => {
    render(
      <ChessBoard
        onCapture={mockOnCapture}
        onTurnChange={mockOnTurnChange}
        onStatusChange={mockOnStatusChange}
        onMoveRecord={mockOnMoveRecord}
      />
    );

    // Try to move a black piece when it's white's turn
    const blackPawn = screen.getByText('♟');
    fireEvent.click(blackPawn);

    // No valid moves should be shown
    const validMoves = screen.queryAllByTestId('valid-move');
    expect(validMoves).toHaveLength(0);

    // Verify turn hasn't changed
    expect(mockOnTurnChange).not.toHaveBeenCalled();
  });

  test('allows capturing opponent pieces', async () => {
    render(
      <ChessBoard
        onCapture={mockOnCapture}
        onTurnChange={mockOnTurnChange}
        onStatusChange={mockOnStatusChange}
        onMoveRecord={mockOnMoveRecord}
      />
    );

    // Setup a position where white can capture black
    // First move white pawn
    const whitePawn = screen.getByText('♙');
    fireEvent.click(whitePawn);
    const validMove = screen.getByTestId('valid-move');
    fireEvent.click(validMove);

    // Mock turn has changed to black
    mockOnTurnChange.mockClear();

    // Move black pawn into capture position
    const blackPawn = screen.getByText('♟');
    fireEvent.click(blackPawn);
    const blackValidMove = screen.getByTestId('valid-move');
    fireEvent.click(blackValidMove);
    
    // Now white should be able to capture
    const whitePieceToCapture = screen.getAllByText('♙')[1];
    fireEvent.click(whitePieceToCapture);
    
    // Find valid capture move and click it
    const captureMove = screen.getByTestId('valid-move');
    fireEvent.click(captureMove);

    // Verify capture was called
    expect(mockOnCapture).toHaveBeenCalled();
  });

  test('detects check when king is threatened', () => {
    render(
      <ChessBoard
        onCapture={mockOnCapture}
        onTurnChange={mockOnTurnChange}
        onStatusChange={mockOnStatusChange}
        onMoveRecord={mockOnMoveRecord}
      />
    );

    // Setup a "fool's mate" scenario
    // 1. Move white pawn at f2 to f3
    const whitePawnF = screen.getAllByText('♙')[5]; // f2 pawn
    fireEvent.click(whitePawnF);
    let validMove = screen.getByTestId('valid-move');
    fireEvent.click(validMove);

    // 2. Move black pawn at e7 to e5
    const blackPawnE = screen.getAllByText('♟')[4]; // e7 pawn
    fireEvent.click(blackPawnE);
    validMove = screen.getByTestId('valid-move');
    fireEvent.click(validMove);

    // 3. Move white pawn at g2 to g4
    const whitePawnG = screen.getAllByText('♙')[6]; // g2 pawn
    fireEvent.click(whitePawnG);
    validMove = screen.getByTestId('valid-move');
    fireEvent.click(validMove);

    // 4. Move black queen to h4 (checkmate)
    const blackQueen = screen.getByText('♛');
    fireEvent.click(blackQueen);
    
    // Find and click the valid move to put the king in check
    const checkMove = screen.getByTestId('valid-move');
    fireEvent.click(checkMove);

    // Verify status change to check or checkmate
    expect(mockOnStatusChange).toHaveBeenCalledWith(expect.stringMatching(/check|checkmate/));
  });
}); 