class SamplePadsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_sample_pad, only: [:show, :edit, :update, :destroy]
  before_action :authorize_user!, only: [:show, :edit, :update, :destroy]

  def index
    @sample_pads = current_user.sample_pads
  end

  def show
    @samples = @sample_pad.samples
  end

  def new
    @sample_pad = current_user.sample_pads.new
  end

  def create
    @sample_pad = current_user.sample_pads.new(sample_pad_params)

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
      format.html { redirect_to sample_pads_path, notice: "Sample pad was successfully deleted." }
      format.turbo_stream { flash.now[:notice] = "Sample pad was successfully deleted." }
    end
  end

  private

  def set_sample_pad
    @sample_pad = SamplePad.find(params[:id])
  end

  def authorize_user!
    unless @sample_pad.user == current_user
      redirect_to sample_pads_path, alert: "You are not authorized to view this sample pad."
    end
  end

  def sample_pad_params
    params.require(:sample_pad).permit(:name)
  end
end
