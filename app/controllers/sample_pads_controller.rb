class SamplePadsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_sample_pad, only: [:show, :edit, :update, :destroy]
  before_action :authorize_user!, only: [:show, :edit, :update, :destroy]

  def index
    # Redirect to the user's single sample pad if it exists
    if current_user.sample_pad
      redirect_to sample_pad_path(current_user.sample_pad)
    else
      # Fallback in case user doesn't have a sample pad yet
      redirect_to new_sample_pad_path
    end
  end

  def show
    @samples = @sample_pad.samples
  end

  def new
    # Redirect if user already has a sample pad
    if current_user.sample_pad
      redirect_to sample_pad_path(current_user.sample_pad), notice: "You already have a sample pad."
    else
      @sample_pad = SamplePad.new(user: current_user)
    end
  end

  def create
    # Don't allow creating if user already has a sample pad
    if current_user.sample_pad
      respond_to do |format|
        format.html { redirect_to sample_pad_path(current_user.sample_pad), alert: "You already have a sample pad." }
        format.turbo_stream { flash.now[:alert] = "You already have a sample pad." }
      end
      return
    end

    @sample_pad = SamplePad.new(sample_pad_params)
    @sample_pad.user = current_user

    respond_to do |format|
      if @sample_pad.save
        format.html { redirect_to sample_pad_path(@sample_pad), notice: "Sample pad was successfully created." }
        format.turbo_stream { flash.now[:notice] = "Sample pad was successfully created." }
      else
        format.html { render :new, status: :unprocessable_entity }
        format.turbo_stream { render turbo_stream: turbo_stream.replace("new_sample_pad", partial: "sample_pads/form", locals: { sample_pad: @sample_pad }) }
      end
    end
  end

  def edit
  end

  def update
    respond_to do |format|
      if @sample_pad.update(sample_pad_params)
        format.html { redirect_to sample_pad_path(@sample_pad), notice: "Sample pad was successfully updated." }
        format.turbo_stream { flash.now[:notice] = "Sample pad was successfully updated." }
      else
        format.html { render :edit, status: :unprocessable_entity }
        format.turbo_stream { render turbo_stream: turbo_stream.replace("edit_sample_pad", partial: "sample_pads/form", locals: { sample_pad: @sample_pad }) }
      end
    end
  end

  def destroy
    @sample_pad.destroy

    respond_to do |format|
      format.html { redirect_to new_sample_pad_path, notice: "Sample pad was successfully deleted." }
      format.turbo_stream { flash.now[:notice] = "Sample pad was successfully deleted." }
    end
  end

  private

  def set_sample_pad
    @sample_pad = SamplePad.find(params[:id])
  end

  def authorize_user!
    unless @sample_pad.user == current_user
      redirect_to root_path, alert: "You are not authorized to view this sample pad."
    end
  end

  def sample_pad_params
    params.require(:sample_pad).permit(:name)
  end
end
